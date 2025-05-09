const express = require('express');
const { obtenerLogs, registrarLog } = require('../controllers/logsController');
const autenticar = require('../middlewares/autenticar');

const router = express.Router();

// Ruta para obtener todos los logs
router.get('/', autenticar, obtenerLogs);

// Ruta para registrar un nuevo log
router.post('/', autenticar, registrarLog);

module.exports = router;