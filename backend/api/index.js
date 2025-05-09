const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')
const serverless = require('serverless-http') // necesario para adaptar express

const app = express()

const allowedOrigins = ['https://calculadora-delivery.vercel.app']

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(new Error('Acceso no permitido'), false)
    if (allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Acceso no permitido'), false)
  },
  methods: 'GET,POST',
  allowedHeaders: 'Content-Type'
}

app.use(cors(corsOptions))
app.use(express.json())

// rutas
app.get('/precios', (req, res) => {
  const preciosPath = path.join(__dirname, 'precios.json')
  fs.readFile(preciosPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer el archivo de precios' })
    res.json(JSON.parse(data))
  })
})

app.post('/precios', (req, res) => {
  const preciosPath = path.join(__dirname, 'precios.json')
  fs.writeFile(preciosPath, JSON.stringify(req.body, null, 2), (err) => {
    if (err) return res.status(500).json({ error: 'Error al guardar los precios' })
    res.json({ message: 'Precios guardados correctamente' })
  })
})

app.get('/log', (req, res) => {
  const logsPath = path.join(__dirname, 'logs.json')
  fs.readFile(logsPath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Error al leer el archivo de logs' })
    res.json(JSON.parse(data))
  })
})

app.post('/log', (req, res) => {
  const { direccion, result } = req.body
  if (!result || !result.geometry) {
    const errorLog = {
      direccion,
      fecha: new Date().toLocaleString('es-AR', { timeZone: 'America/Argentina/Buenos_Aires' }),
      error: 'No se encontraron coordenadas'
    }
    return guardarLog(errorLog, res)
  }

  const fecha = new Date().toLocaleString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })

  const tipoTraduccion = {
    building: 'Edificio',
    road: 'Calle',
    city: 'Ciudad',
    village: 'Pueblo',
    state: 'Provincia',
    country: 'Pais'
  }

  const tipo = result.components._type
  const tipoTraducido = tipoTraduccion[tipo] || tipo

  const log = {
    direccion_ingresada: direccion,
    direccion_geocodificada: result.formatted,
    tipo: tipoTraducido,
    long_lat: `${result.geometry.lng}, ${result.geometry.lat}`,
    fecha
  }

  guardarLog(log, res)
})

function guardarLog(log, res) {
  const logsPath = path.join(__dirname, 'logs.json')
  fs.readFile(logsPath, 'utf8', (err, data) => {
    let logs = []
    if (!err && data) {
      try {
        logs = JSON.parse(data)
      } catch (parseErr) {
        console.error('Error al parsear logs.json:', parseErr)
      }
    }
    logs.push(log)
    fs.writeFile(logsPath, JSON.stringify(logs, null, 2), (err) => {
      if (err) {
        console.error('Error al guardar el log:', err)
        return res.status(500).json({ error: 'Error al guardar el log' })
      }
      res.json({ message: 'Log guardado correctamente' })
    })
  })
}

// Exporta como funcion serverless
module.exports = serverless(app)
