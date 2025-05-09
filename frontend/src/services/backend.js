// Función para obtener los precios desde el servidor
export const obtenerPrecios = async (token) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/precios`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("No se pudo obtener los precios");
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener los precios:", error);
    throw error;
  }
};

// Funcion para obtener la direccion de origen del usuario autenticado
export const obtenerDirecOrigen = async (token) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/usuarios/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener la dirección de origen");
    }

    const data = await response.json();
    // Devuelve la dirección de origen, longitud y latitud
    return {
      origen_direc: data.origen_direc,
      origen_lng: data.origen_lng,
      origen_lat: data.origen_lat,
    };
  } catch (error) {
    console.error("Error al obtener la dirección de origen:", error);
    throw error;
  }
};

// Función para guardar los precios en el servidor
export const actualizarPrecios = async (nuevosPrecios, token) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/precios`, {
      method: "PUT", // Cambiado de POST a PUT
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevosPrecios),
    });

    if (!response.ok) {
      throw new Error("Error al guardar los precios");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al guardar los precios:", error);
    throw error;
  }
};

// Funcion para actualizar la ubicacion de origen del usuario
export const actualizarUbicacion = async (nuevaUbicacion, token) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/usuarios/direccion`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(nuevaUbicacion),
    });

    if (!response.ok) {
      throw new Error("Error al actualizar la dirección de origen");
    }

    const data = await response.json();
    return data; 
  } catch (error) {
    console.error("Error al actualizar la dirección de origen:", error);
    throw error;
  }
};

// Funcion para registrar un nuevo usuario
export const registrarUsuario = async (email, password, origen) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/usuarios/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, origen }),
    });

    if (!response.ok) {
      throw new Error("Error al registrar el usuario");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al registrar el usuario:", error);
    throw error;
  }
};

// Función para iniciar sesión
export const iniciarSesion = async (email, password) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/usuarios/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error("Error al iniciar sesión");
    }

    const data = await response.json();
    return data; // Devuelve el token
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    throw error;
  }
};

// Función para obtener datos del usuario autenticado
export const obtenerDatosUsuario = async (token) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/usuarios/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Error al obtener los datos del usuario");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al obtener los datos del usuario:", error);
    throw error;
  }
};

// Función para registrar logs de consultas
export const logConsulta = async (token, direccion, result) => {
  const payload = {
    direccion_ingresada: direccion,
    direccion_geocodificada: result?.direccion_geocodificada || null,
    long_lat: result?.coordenadas
      ? `${result.coordenadas.lat()},${result.coordenadas.lng()}`
      : null,
    error: result?.error || null,
    tipo_ubicacion: result.tipo_ubicacion,
    status: result.status,
  };
  await fetch(`${process.env.REACT_APP_BACKEND_URL}/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
};

// Función para obtener los logs del backend
export const obtenerLogs = async (token) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/logs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      throw new Error("No se pudieron obtener los logs");
    }
    const logs = await response.json();
    return logs;
  } catch (error) {
    console.error("Error al obtener logs:", error);
    throw error;
  }
};