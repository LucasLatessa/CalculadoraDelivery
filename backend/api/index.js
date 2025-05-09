const express = require('express');
const app = express();

// Middleware y rutas
app.use(express.json());

// Ruta de ejemplo
app.get('/api/hello', (req, res) => {
  res.json({ message: 'Hola desde Vercel Serverless!' });
});

// Exporta la aplicación como una función manejadora
module.exports = app;
