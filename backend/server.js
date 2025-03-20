const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors') 
require("dotenv").config();
const polyline = require("@mapbox/polyline"); // Necesario para decodificar la polyline


const app = express()
const port = 3001
const allowedOrigins = ['https://calculadora-delivery.vercel.app'];
const API_KEY_GMAPS = process.env.GOOGLE_MAPS_API_KEY;
const API_KEY_DISTANCE =process.env.DISTANCE_API_KEY
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

app.post("/recorrido", async (req, res) => {
  try {
    const { direcciones } = req.body;
    
    if (!Array.isArray(direcciones) || direcciones.length < 2) {
      return res.status(400).json({ error: "Se necesitan al menos dos direcciones." });
    }

    const origin = direcciones[0];  // Punto de inicio fijo
    let waypoints = direcciones.slice(1);  // Optimizar todos menos el primero

    if (waypoints.length > 1) {
      // Obtener distancias usando Google Distance Matrix API
      const matrixResponse = await fetch(
        `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin}&destinations=${waypoints.join("|")}&key=${API_KEY_DISTANCE}`
      );

      const matrixData = await matrixResponse.json();
      if (!matrixData.rows || matrixData.rows.length === 0 || !matrixData.rows[0]) {
        throw new Error("No se pudo obtener la matriz de distancias.");
      }
      

      // Ordenar waypoints desde el origen usando algoritmo greedy
      waypoints = ordenarWaypoints(matrixData, waypoints);
    }

    // Hacer la petición a Routes API con el orden optimizado
    const body = {
      origin: { address: origin },
      destination: { address: waypoints[waypoints.length - 1] },
      intermediates: waypoints.slice(0, -1).map((direccion) => ({ address: direccion })),
      travelMode: "DRIVE",
      routingPreference: "TRAFFIC_AWARE_OPTIMAL",
    };

    const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY_GMAPS,
        "X-Goog-FieldMask": "routes.distanceMeters,routes.polyline.encodedPolyline,routes.legs",
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    //console.log(JSON.stringify(data, null, 2));//mostrar response de la API
    if (!data.routes || data.routes.length === 0) {
      throw new Error("No se pudo calcular la ruta.");
    }

    // Decodificar la polyline en coordenadas de ruta
    const rutaCoordenadas = polyline.decode(data.routes[0].polyline.encodedPolyline).map(([lat, lng]) => ({
      lat,
      lng,
    }));

    let paradas = [];
    data.routes[0].legs.forEach((leg, index) => {
      if (index === 0) {
        paradas.push({
          lat: leg.startLocation.latLng.latitude,
          lng: leg.startLocation.latLng.longitude,
        });
      }
      paradas.push({
        lat: leg.endLocation.latLng.latitude,
        lng: leg.endLocation.latLng.longitude,
      });
    });
    const duracionMinutos = Math.ceil(data.routes[0].legs.reduce((total, leg) => total + parseInt(leg.duration.replace("s", ""), 10), 0) / 60);
    res.json({
      distanciaTotal: data.routes[0].distanceMeters,
      rutaCoordenadas,
      paradas,
      duracionMinutos,
    });

  } catch (error) {
    console.error("Error en la solicitud:", error);
    res.status(500).json({ error: "Error en la solicitud de optimización y cálculo de ruta" });
  }
});

// Algoritmo para ordenar los waypoints
function ordenarWaypoints(matrixData, waypoints) {
  let ordenados = [];
  let restantes = [...waypoints];

  // Seleccionar el punto más cercano al origen como el primero en la ruta
  while (restantes.length > 0) {
    let masCercanoIndex = 0;
    let menorDistancia = Infinity;

    for (let i = 0; i < restantes.length; i++) {
      let distancia = matrixData.rows[0].elements[i].distance.value;
      if (distancia < menorDistancia) {
        menorDistancia = distancia;
        masCercanoIndex = i;
      }
    }

    ordenados.push(restantes[masCercanoIndex]);
    restantes.splice(masCercanoIndex, 1);
  }

  return ordenados;
}

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
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`)
})
