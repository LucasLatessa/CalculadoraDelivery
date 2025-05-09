const pool = require('../db');

// Registrar un nuevo usuario
const registrarUsuario = async (email, password, direccion) => {
  await pool.query('INSERT INTO usuarios (email, password, origen_direc, origen_lat, origen_lng) VALUES (?, ?, ?, ?, ?)', [
    email,
    password,
    direccion.origen_direc,
    direccion.origen_lat,
    direccion.origen_lng, 
  ]);
};

// Obtener un usuario por email
const obtenerUsuarioPorEmail = async (email) => {
  const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
  return rows[0];
};

// Obtener datos del usuario por ID
const obtenerDatosUsuario = async (id) => {
  const [rows] = await pool.query('SELECT id, email, origen_direc, origen_lat, origen_lng FROM usuarios WHERE id = ?', [id]);
  return rows[0];
};
// Actualizar la dirección de origen del usuario
const actualizarDireccionUsuario = async (usuarioId, nuevaDireccion) => {
  const query = `
    UPDATE usuarios 
    SET origen_direc = ?, origen_lat = ?, origen_lng = ? 
    WHERE id = ?
  `;

  await pool.query(query, [
    nuevaDireccion.origen_direc,
    nuevaDireccion.origen_lat,
    nuevaDireccion.origen_lng, 
    usuarioId,
  ]);
};

module.exports = {
  registrarUsuario,
  obtenerUsuarioPorEmail,
  obtenerDatosUsuario,
  actualizarDireccionUsuario,
};