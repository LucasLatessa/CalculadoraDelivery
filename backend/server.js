const express = require('express')
const fs = require('fs')
const path = require('path')
const cors = require('cors')  // Importamos el paquete cors

const app = express()
const port = 3001

// Middleware para habilitar CORS (permite solicitudes desde otros dominios)
app.use(cors())  // Esto habilita CORS para todas las rutas

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

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor backend corriendo en http://localhost:${port}`)
})
