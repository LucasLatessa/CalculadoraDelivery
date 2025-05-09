const { registrarUsuario, obtenerUsuarioPorEmail, obtenerDatosUsuario, actualizarDireccionUsuario } = require('../models/usuariosModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Registrar un nuevo usuario
const registrar = async (req, res) => {
  const { email, password, direccion } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await registrarUsuario(email, hashedPassword, direccion);
    res.json({ message: 'Usuario registrado correctamente' });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};
// Actualizar la dirección de origen del usuario
const actualizarDireccion = async (req, res) => {
  const { id } = req.user; // ID del usuario autenticado
  const origen = req.body; // Nueva dirección de origen
  try {
    await actualizarDireccionUsuario(id, origen);
    res.json({ message: 'Dirección de origen actualizada correctamente' });
  } catch (error) {
    console.error('Error al actualizar la dirección de origen:', error);
    res.status(500).json({ error: 'Error al actualizar la dirección de origen' });
  }
};

// Iniciar sesión
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const usuario = await obtenerUsuarioPorEmail(email);
    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    const esValido = await bcrypt.compare(password, usuario.password);
    if (!esValido) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

// Obtener datos del usuario
const obtenerDatos = async (req, res) => {
  const { id } = req.user; // ID del usuario autenticado
  try {
    const datosUsuario = await obtenerDatosUsuario(id);
    res.json(datosUsuario);
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    res.status(500).json({ error: 'Error al obtener datos del usuario' });
  }
};

module.exports = { registrar, login, obtenerDatos, actualizarDireccion };