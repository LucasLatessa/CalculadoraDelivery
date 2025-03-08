const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')  // Importamos el paquete cors

const app = express()
const port = 3001

const corsOptions = {
  origin: 'https://calculadora-delivery.vercel.app', // Solo permite este dominio
  methods: 'GET,POST', // Métodos HTTP permitidos
  allowedHeaders: 'Content-Type' // Headers permitidos
};

app.use(cors(corsOptions));
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
      fecha: new Date().toISOString(),
      error: 'No se encontraron coordenadas'
    };

    return guardarLog(errorLog, res);
  }
  const fecha = new Date();
  const fechaFormateada = `${fecha.getFullYear()}-${(fecha.getMonth() + 1).toString().padStart(2, '0')}-${fecha.getDate().toString().padStart(2, '0')} ${fecha.getHours().toString().padStart(2, '0')}:${fecha.getMinutes().toString().padStart(2, '0')}:${fecha.getSeconds().toString().padStart(2, '0')}`;

  // Extraer datos relevantes del resultado de OpenCage
  const log = {
    direccion_ingresada: direccion,
    direccion_geocodificada: result.formatted,
    tipo: result.components._type,
    long_lat: `${result.geometry.lng}, ${result.geometry.lat}`,
    fecha: fechaFormateada
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
