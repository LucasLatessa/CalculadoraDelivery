const express = require('express')
const cors = require('cors')
const pool = require('./db')
require("dotenv").config();

const app = express()
const port = 3001
const allowedOrigins = ['https://speziadelivery.vercel.app'];

app.use(cors({
  origin: function (origin, callback) {
    // Permite requests sin origin (como postman o curl) o si el origin esta en la lista
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('No permitido por CORS'));
    }
  }
}));
/* app.use(cors()) */
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
  const nuevosPrecios = req.body; 
  try {
    const conn = await pool.getConnection();
    await conn.beginTransaction();

    await conn.query('DELETE FROM precios');

    const values = nuevosPrecios.map(p => [parseInt(p.cuadras, 10), parseInt(p.precio, 10)]);
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
  const {
    direccion_ingresada,
    direccion_geocodificada,
    long_lat,
    tipo_ubicacion,
    status,
    error
  } = req.body;

  const fecha = new Date().toISOString().slice(0, 19).replace('T', ' ');
  
  try {
    await pool.query(
      'INSERT INTO logs (direccion_ingresada, direccion_geocodificada, long_lat, tipo_ubicacion, fecha, error, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        direccion_ingresada || null,
        direccion_geocodificada || null,
        long_lat || null,
        tipo_ubicacion || null,
        fecha,
        error || null,
        status || null
      ]
    );
    res.json({ message: 'Log guardado correctamente' });
  } catch (error) {
    console.error('Error al guardar el log:', error);
    res.status(500).json({ error: 'Error al guardar el log' });
  }
});

app.listen(port, () => {
  console.log(`Servidor backend corriendo en ${port}`)
}); 