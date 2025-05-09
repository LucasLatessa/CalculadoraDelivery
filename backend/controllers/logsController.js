const { obtenerLogsPorUsuario, registrarNuevoLog } = require('../models/logsModel');

// Obtener todos los logs
const obtenerLogs = async (req, res) => {
  const { id: usuarioId } = req.user; // ID del usuario autenticado
  try {
    const logs = await obtenerLogsPorUsuario(usuarioId);
    res.json(logs);
  } catch (error) {
    console.error('Error al obtener logs:', error);
    res.status(500).json({ error: 'Error al obtener logs' });
  }
};

// Registrar un nuevo log
const registrarLog = async (req, res) => {
  const { id: usuarioId } = req.user; // ID del usuario autenticado
  const resultado  = req.body;
  try {
    await registrarNuevoLog(usuarioId, resultado);
    res.json({ message: 'Log registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar log:', error);
    res.status(500).json({ error: 'Error al registrar log' });
  }
};

module.exports = { obtenerLogs, registrarLog };