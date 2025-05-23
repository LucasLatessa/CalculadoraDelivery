const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors') 
const originValidator = require('./originValidator');
const app = express()
const port = process.env.PORT;

app.use(cors())
// Aplica el middleware a todas las rutas
app.use(originValidator);

// Middleware para parsear el cuerpo de las solicitudes JSON
app.use(express.json())
// Middleware para loguear cada solicitud entrante
app.use((req, res, next) => {
  const inicio = new Date();
  const fechaArgentina = inicio.toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires'
  });

  res.on('finish', () => {
    console.log(`[${fechaArgentina}] ${req.method} ${req.originalUrl} - ${res.statusCode}`);
  });

  next();
});

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
app.get('/', (req, res) => {
  res.send('Acceso permitido');
});
// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`)
})