const pool = require('../db');

// Obtener todos los logs
const obtenerLogsPorUsuario = async (usuarioId) => {
  const [rows] = await pool.query('SELECT * FROM logs WHERE usuario_id = ? ORDER BY fecha DESC', [usuarioId]);
  return rows;
};

// Registrar un nuevo log
const registrarNuevoLog = async (usuarioId, resultado) => {
  await pool.query('INSERT INTO logs (direccion_ingresada, direccion_geocodificada, long_lat, tipo_ubicacion, status, error, fecha, usuario_id) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)', [
    resultado.direccion_ingresada,
    resultado.direccion_geocodificada, 
    resultado.long_lat, 
    resultado.tipo_ubicacion, 
    resultado.status, 
    resultado.error,
    usuarioId,
  ]); 
};

module.exports = {
  obtenerLogsPorUsuario,
  registrarNuevoLog,
};