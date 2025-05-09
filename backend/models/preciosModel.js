const pool = require('../db');

// Obtener precios por usuario
const obtenerPreciosPorUsuario = async (usuarioId) => {
  const [rows] = await pool.query('SELECT * FROM precios WHERE usuario_id = ? ORDER BY cuadras', [usuarioId]);
  return rows;
};

// Actualizar precios para un usuario
const actualizarPreciosPorUsuario = async (usuarioId, nuevosPrecios) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Obtener precios actuales del usuario
    const preciosActuales = await obtenerPreciosPorUsuario(usuarioId);

    // Crear listas para operaciones
    const preciosAActualizar = [];
    const preciosAInsertar = [];
    const idsRecibidos = nuevosPrecios.map((p) => p.id); // IDs recibidos en la solicitud
    const idsAEliminar = preciosActuales
      .filter((p) => !idsRecibidos.includes(p.id)) // Si el ID actual no está en los recibidos, eliminar
      .map((p) => p.id);

    // Comparar precios actuales con los nuevos
    nuevosPrecios.forEach((nuevoPrecio) => {
      if (nuevoPrecio.id === null) {
        // Si el ID es null, insertar un nuevo precio
        preciosAInsertar.push(nuevoPrecio);
      } else {
        // Si el precio ya existe, actualizar si es necesario
        const precioExistente = preciosActuales.find((p) => p.id === nuevoPrecio.id);
        if (precioExistente && (precioExistente.precio !== nuevoPrecio.precio || precioExistente.cuadras !== nuevoPrecio.cuadras)) {
          preciosAActualizar.push(nuevoPrecio);
        }
      }
    });

    // Realizar las operaciones en la base de datos
    for (const precio of preciosAActualizar) {
      await conn.query('UPDATE precios SET cuadras = ?, precio = ? WHERE id = ?', [
        precio.cuadras,
        precio.precio,
        precio.id,
      ]);
    }

    for (const precio of preciosAInsertar) {
      await conn.query('INSERT INTO precios (usuario_id, cuadras, precio) VALUES (?, ?, ?)', [
        usuarioId,
        precio.cuadras,
        precio.precio,
      ]);
    }

    for (const id of idsAEliminar) {
      await conn.query('DELETE FROM precios WHERE id = ?', [id]);
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
};


module.exports = {
  obtenerPreciosPorUsuario,
  actualizarPreciosPorUsuario,
};