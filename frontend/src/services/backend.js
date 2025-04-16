// Función para obtener los precios desde el servidor
export const obtenerPrecios = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/precios`);
      const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener los precios:", error);
    throw new Error("No se pudo obtener los precios");
  }
}

// Función para guardar los precios en el servidor
export const actualizarPrecios = async (nuevosPrecios) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/precios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(nuevosPrecios),
    });

    if (!response.ok) {
      throw new Error('Error al guardar los precios');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al guardar los precios:", error);
    throw error; // Re-lanzamos el error para manejarlo donde se llame
  }
};

// Funcion envia la dirección y el status al backend
export const logConsulta = async (direccion, result) => {
  const payload = {
    direccion_ingresada: direccion,
    direccion_geocodificada: result?.direccion_geocodificada || null,
    long_lat: result?.coordenadas 
      ? `${result.coordenadas.lat()},${result.coordenadas.lng()}`
      : null,
    error: result?.error || null,
    tipo_ubicacion: result.tipo_ubicacion,
    status: result.status,

  }
  console.log( 'payload', payload)

  await fetch(`${process.env.REACT_APP_BACKEND_URL}/log`, {  
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
// Función para obtener los logs del backend
export const obtenerLogs = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/log`);
    if (!response.ok) {
      throw new Error('No se pudieron obtener los logs');
    }
    const logs = await response.json();
    return logs;
  } catch (error) {
    console.error('Error al obtener logs:', error);
    throw error;
  }
};