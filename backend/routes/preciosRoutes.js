const express = require('express');
const { obtenerPrecios, actualizarPrecios } = require('../controllers/preciosController');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();

// Obtener precios del usuario autenticado
router.get('/', autenticar, obtenerPrecios);

// Actualizar precios del usuario autenticado
router.put('/', autenticar, actualizarPrecios);

module.exports = router;