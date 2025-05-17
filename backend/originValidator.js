require('dotenv').config();

const allowedOrigins = [process.env.ALLOWED_ORIGIN];

const originValidator = (req, res, next) => {
  const origin = req.headers.origin;

  // Si no hay origin, puede ser una herramienta como Postman o curl
  if (!origin) {
    return res.status(403).json({ error: 'Origen no permitido' });
  }
  console.log("Origen:",origin);
  // Verifica si el origin esta en la lista de permitidos
  if (allowedOrigins.includes(origin)) {
    return next();
  }
  

  return res.status(403).json({ error: 'Origen no permitido' });
};

module.exports = originValidator;