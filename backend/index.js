const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const usuariosRoutes = require('./routes/usuariosRoutes');
const preciosRoutes = require('./routes/preciosRoutes');
const logsRoutes = require('./routes/logsRoutes');

// Configuración de variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors());
app.use(express.json()); // Para parsear JSON en las solicitudes

// Rutas
app.use('/usuarios', usuariosRoutes);
app.use('/logs', logsRoutes);
app.use('/precios', preciosRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.send('Servidor backend corriendo correctamente');
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en el puerto ${PORT}`);
});