const express = require('express')
const cors = require('cors')
const pool = require('./db') // importamos la conexion a la base de datos
require("dotenv").config();

const app = express()
const port = 3001
const allowedOrigins = ['https://speziadelivery.vercel.app'];

/* app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sin origin (como postman o curl) o si el origin esta en la lista
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
})); */
app.use(cors())
app.use(express.json())

// Obtener precios desde la base de datos
app.get('/precios', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM precios ORDER BY cuadras');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener precios:', error);
    res.status(500).json({ error: 'Error al obtener precios' });
  }
});

// Guardar precios en la base de datos
app.post('/precios', async (req, res) => {
  const nuevosPrecios = req.body; // se espera un objeto tipo { "10": 1100, "15": 1600, ... }

  try {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.query('DELETE FROM precios');

    const values = Object.entries(nuevosPrecios).map(([cuadras, precio]) => [parseInt(cuadras), precio]);
    await conn.query('INSERT INTO precios (cuadras, precio) VALUES ?', [values]);

    await conn.commit();
    conn.release();
    res.json({ message: 'Precios actualizados correctamente' });
  } catch (error) {
    console.error('Error al actualizar precios:', error);
    res.status(500).json({ error: 'Error al actualizar precios' });
  }
});

// Obtener logs
app.get('/log', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM logs ORDER BY fecha DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener logs:', error);
    res.status(500).json({ error: 'Error al obtener logs' });
  }
})

// Guardar logs
app.post('/log', async (req, res) => {
  const { direccion, result } = req.body;

  if (!result || !result.geometry) {
    return guardarLog({
      direccion_ingresada: direccion,
      error: 'No se encontraron coordenadas'
    }, res);
  }

  const fecha = new Date().toISOString();
  const tipoTraduccion = {
    building: "Edificio",
    road: "Calle",
    city: "Ciudad",
    village: "Pueblo",
    state: "Provincia",
    country: "Pais",
  };

  const tipo = result.components._type;
  const tipoTraducido = tipoTraduccion[tipo] || tipo;

  const log = {
    direccion_ingresada: direccion,
    direccion_geocodificada: result.formatted,
    tipo: tipoTraducido,
    long_lat: `${result.geometry.lng}, ${result.geometry.lat}`,
    fecha
  };

  guardarLog(log, res);
});

const guardarLog = async (log, res) => {
  try {
    await pool.query(
      'INSERT INTO logs (direccion_ingresada, direccion_geocodificada, tipo, long_lat, fecha, error) VALUES (?, ?, ?, ?, ?, ?)',
      [
        log.direccion_ingresada,
        log.direccion_geocodificada || null,
        log.tipo || null,
        log.long_lat || null,
        log.fecha,
        log.error || null
      ]
    );
    res.json({ message: 'Log guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar el log:', error);
    res.status(500).json({ error: 'Error al guardar el log' });
  }
};

app.listen(port, () => {
  console.log(`Servidor backend corriendo en ${port}`)
});
