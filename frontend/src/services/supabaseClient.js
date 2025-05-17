import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL_AUTH;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY_AUTH;
const supabase = createClient(supabaseUrl, supabaseKey);

const manejarError = (error, mensaje) => {
  if (error) throw new Error(mensaje);
};

export const verificarSesion = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.user; // true si hay usuario, false si no
};

export const signUp = async (email, password, origen) => {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
  })

  if (signUpError) throw new Error("Error al registrar el usuario")
  const userId = signUpData.user.id

  // Insertar datos adicionales en tabla usuarios
  const { error: insertError } = await supabase.from('usuarios').insert({
    id: userId,
    email,
    ...origen, // origen_direc, origen_lat, origen_lng
  })

  manejarError(insertError, "Error al guardar datos de usuario");
}

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  // Manejo de errores
  if (error) {
    manejarError(error, "Credenciales inválidas. Por favor, inténtalo de nuevo.");
    throw error; 
  }
  const token = data.session.access_token;
  if (!token) {
    throw new Error("No se pudo obtener el token de acceso.");
  }
  return token; 
};

const getUserId = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  manejarError(error || !user, "No hay usuario autenticado");
  return user.id
}

export const getUser = async () => {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('usuarios')
    .select('*')
    .eq('id', userId)
    .single()

  manejarError(error, "Error al obtener datos de usuario");
  return data
}

export const obtenerDirecOrigen = async () => {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('usuarios')
    .select('origen_direc, origen_lat, origen_lng')
    .eq('id', userId)
    .single()

  manejarError(error, "No se pudo obtener la direccion");
  return data
}

export const actualizarDirecOrigen = async (nuevaUbicacion) => {
  const userId = await getUserId()
  const { error } = await supabase
    .from('usuarios')
    .update(nuevaUbicacion)
    .eq('id', userId)

   manejarError(error, "Error al actualizar direccion de origen");
}


export const logout = async () => {
  await supabase.auth.signOut()
}

export const obtenerPrecios = async () => {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('precios')
    .select('*')
    .eq('usuario_id', userId)
    .order('cuadras')

  manejarError(error, "No se pudo obtener los precios");
  return data
}

export const actualizarPrecios = async (nuevosPrecios) => {
  const userId = await getUserId()
  // Obtener precios actuales
  const { data: preciosActuales, error: errorActuales } = await supabase
    .from('precios')
    .select('*')
    .eq('usuario_id', userId)

  manejarError(errorActuales, "Error al obtener precios actuales");

  // Preparar listas
  const preciosAActualizar = []
  const preciosAInsertar = []
  const idsRecibidos = nuevosPrecios.map(p => p.id)
  const idsAEliminar = preciosActuales
    .filter(p => !idsRecibidos.includes(p.id))
    .map(p => p.id)

  nuevosPrecios.forEach(nuevo => {
    if (!nuevo.id) {
      preciosAInsertar.push(nuevo)
    } else {
      const existente = preciosActuales.find(p => p.id === nuevo.id)
      if (existente &&
          (existente.precio !== nuevo.precio || existente.cuadras !== nuevo.cuadras)) {
        preciosAActualizar.push(nuevo)
      }
    }
  })

  // 1. Actualizar precios
  for (const precio of preciosAActualizar) {
    const { error } = await supabase
      .from('precios')
      .update({
        cuadras: precio.cuadras,
        precio: precio.precio
      })
      .eq('id', precio.id)
    if (error) throw new Error("Error al actualizar precio con id " + precio.id)
  }

  // 2. Insertar nuevos
  for (const precio of preciosAInsertar) {
    const { error } = await supabase
      .from('precios')
      .insert({
        usuario_id: userId,
        cuadras: precio.cuadras,
        precio: precio.precio
      })
    if (error) throw new Error("Error al insertar nuevo precio")
  }

  // 3. Eliminar precios que ya no estan
  for (const id of idsAEliminar) {
    const { error } = await supabase
      .from('precios')
      .delete()
      .eq('id', id)
    if (error) throw new Error("Error al eliminar precio con id " + id)
  }

  return true
}

export const logConsulta = async (direccion, result) => {
  const userId = await getUserId()
  const payload = {
    usuario_id: userId,
    direccion_ingresada: direccion,
    direccion_geocodificada: result?.direccion_geocodificada || null,
    long_lat: result?.coordenadas
      ? `${result.coordenadas.lat()},${result.coordenadas.lng()}`
    : null,
    error: result?.error || null,
    tipo_ubicacion: result.tipo_ubicacion,
    status: result.status,
  }

  const { error } = await supabase.from('logs').insert(payload)

  if (error) console.error("Error al registrar log:", error);
}

export const obtenerLogs = async () => {
  const userId = await getUserId()
  const { data, error } = await supabase
    .from('logs')
    .select('*')
    .eq('usuario_id', userId)
    .order('fecha', { ascending: false })

  manejarError(error, "Error al obtener logs");
  return data
}