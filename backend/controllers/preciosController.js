const { obtenerPreciosPorUsuario, actualizarPreciosPorUsuario } = require('../models/preciosModel');

// Obtener precios del usuario autenticado
const obtenerPrecios = async (req, res) => {
  const { id: usuarioId } = req.user; // ID del usuario autenticado
  try {
    const precios = await obtenerPreciosPorUsuario(usuarioId);
    res.json(precios);
  } catch (error) {
    console.error('Error al obtener precios:', error);
    res.status(500).json({ error: 'Error al obtener precios' });
  }
};

// Actualizar precios del usuario autenticado
const actualizarPrecios = async (req, res) => {
  const { id: usuarioId } = req.user; // ID del usuario autenticado
  const nuevosPrecios = req.body;
  try {
    await actualizarPreciosPorUsuario(usuarioId, nuevosPrecios);
    res.json({ message: 'Precios actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar precios:', error);
    res.status(500).json({ error: 'Error al actualizar precios' });
  }
};

module.exports = { obtenerPrecios, actualizarPrecios };