const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors') 
require("dotenv").config();

const app = express()
const port = 3001/* 
const allowedOrigins = ['https://calculadora-delivery.vercel.app'];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) {
      // Si no hay origen (acceso directo en el navegador), bloquear
      return callback(new Error('Acceso no permitido'), false);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Acceso no permitido'), false);
    }
  },
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type'
};
 */
//app.use(cors(corsOptions));
app.use(cors());
// Middleware para parsear el cuerpo de las solicitudes JSON
app.use(express.json())

// Ruta para obtener los precios
app.get('/precios', (req, res) => {
  const preciosPath = path.join(__dirname, 'precios.json')

  fs.readFile(preciosPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Error al leer el archivo de precios' })
      return
    }

    res.json(JSON.parse(data))
  })
})

// Ruta para guardar los precios
app.post('/precios', (req, res) => {
  const preciosPath = path.join(__dirname, 'precios.json')

  // Guardamos el nuevo objeto de precios
  fs.writeFile(preciosPath, JSON.stringify(req.body, null, 2), (err) => {
    if (err) {
      res.status(500).json({ error: 'Error al guardar los precios' })
      return
    }

    res.json({ message: 'Precios guardados correctamente' })
  })
})

app.get('/log', (req, res) => {
  const logsPath = path.join(__dirname, 'logs.json');

  fs.readFile(logsPath, 'utf8', (err, data) => {
    if (err) {
      res.status(500).json({ error: 'Error al leer el archivo de logs' });
      return;
    }

    res.json(JSON.parse(data));
  });
});

app.post('/log', (req, res) => {
  const { direccion, result } = req.body;

  // Si no hay resultado válido, registrar el error
  if (!result || !result.geometry) {
    const errorLog = {
      direccion,
      fecha: new Date().toLocaleString("es-AR", { timeZone: "America/Argentina/Buenos_Aires" }),
      error: 'No se encontraron coordenadas'
    };

    return guardarLog(errorLog, res);
  }
  const fecha = new Date().toLocaleString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });
  const tipoTraduccion = {
    building: "Edificio",
    road: "Calle",
    city: "Ciudad",
    village: "Pueblo",
    state: "Provincia",
    country: "País",
  };
  
  const tipo = result.components._type;
  const tipoTraducido = tipoTraduccion[tipo] || tipo;  // Si no se encuentra la traducción, mantiene el valor original
  
  // Extraer datos relevantes del resultado de OpenCage
  const log = {
    direccion_ingresada: direccion,
    direccion_geocodificada: result.formatted,
    tipo: tipoTraducido,
    long_lat: `${result.geometry.lng}, ${result.geometry.lat}`,
    fecha: fecha
  };

  guardarLog(log, res);
});

// 📌 Función para guardar los logs en logs.json
const guardarLog = (log, res) => {
  const logsPath = path.join(__dirname, 'logs.json');
  fs.readFile(logsPath, 'utf8', (err, data) => {
    let logs = [];
    if (!err && data) {
      try {
        logs = JSON.parse(data);
      } catch (parseErr) {
        console.error('Error al parsear logs.json:', parseErr);
      }
    }

    logs.push(log);

    fs.writeFile(logsPath, JSON.stringify(logs, null, 2), (err) => {
      if (err) {
        console.error('Error al guardar el log:', err);
        return res.status(500).json({ error: 'Error al guardar el log' });
      }
      res.json({ message: 'Log guardado correctamente' });
    });
  });
};
const apikey= process.env.API_KEY_ORS
app.post('/recorrido', async (req, res) => {
  try {
    const { paradas } = req.body;

    // 🔹 1. SOLICITAR OPTIMIZACIÓN DE RUTA (Ordena las paradas)
    const bodyOptimizacion = {
      jobs: paradas.map((coord, index) => ({
        id: index + 1,
        location: [coord[0], coord[1]], // ORS usa [lon, lat]
      })),
      vehicles: [
        {
          id: 1,
          start: [paradas[0][0], paradas[0][1]], // Punto de inicio (lon, lat)
          profile: "driving-car",
        },
      ],
    };

    const responseOptimizacion = await fetch(
      "https://api.openrouteservice.org/optimization",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apikey,
        },
        body: JSON.stringify(bodyOptimizacion),
      }
    );

    if (!responseOptimizacion.ok) {
      const errorText = await responseOptimizacion.text();
      throw new Error(`Error en ORS Optimización: ${errorText}`);
    }

    const dataOptimizacion = await responseOptimizacion.json();
   
    // 🔹 2. EXTRAER LAS PARADAS OPTIMIZADAS
    const routeSteps = dataOptimizacion.routes[0].steps.map(step => step.location);

    // 🔹 3. SOLICITAR DIRECCIÓN DETALLADA (Para obtener la geometría real)
    const responseDireccion = await fetch(
      `https://api.openrouteservice.org/v2/directions/driving-car/geojson`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: apikey,
        },
        body: JSON.stringify({
          coordinates: routeSteps, // Paradas ordenadas de la optimización
          instructions: false, // No necesitamos instrucciones, solo la geometría
        }),
      }
    );

    if (!responseDireccion.ok) {
      const errorText = await responseDireccion.text();
      throw new Error(`Error en ORS Direcciones: ${errorText}`);
    }

    const dataDireccion = await responseDireccion.json();

    // 🔹 4. ENVIAR RESPUESTA FINAL CON LA GEOMETRÍA
    res.json({
      ruta: dataDireccion.features[0].geometry.coordinates, // Coordenadas de la línea
    });

  } catch (error) {
    console.error("Error en /recorrido:", error);
    res.status(500).json({ error: error.message });
  }
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`)
})
