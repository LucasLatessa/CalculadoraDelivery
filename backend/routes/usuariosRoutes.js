const express = require('express');
const { registrar, login, obtenerDatos,actualizarDireccion } = require('../controllers/usuariosController');
const autenticar = require('../middlewares/autenticar'); 

const router = express.Router();

// Ruta para registrar un nuevo usuario
router.post('/register', registrar);

// Ruta para iniciar sesión
router.post('/login', login);

// Ruta para obtener datos del usuario autenticado
router.get('/me', autenticar, obtenerDatos);

// Ruta para actualizar la direccion de origen
router.put('/direccion', autenticar, actualizarDireccion);

module.exports = router;