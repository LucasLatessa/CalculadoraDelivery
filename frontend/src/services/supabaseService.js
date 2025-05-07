import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


// Función para obtener los precios desde el servidor
export const fetchPrecios = async () => {
  try {
    const { data, error } = await supabase.from('precios').select('*').order('cuadras', { ascending: true });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error al obtener precios:', error.message);
    throw error;
  }
};

// Funcion para guardar los precios en el servidor
export const savePrecios = async (nuevosPrecios) => {
  try {
    const { error } = await supabase
      .from('precios')
      .delete()
      .then(() => supabase.from('precios').upsert(nuevosPrecios));
    if (error) throw error;
    return { message: 'Precios actualizados correctamente' };
  } catch (error) {
    console.error('Error al actualizar precios:', error.message);
    throw error;
  }
};

// Funcion envia la dirección y el status al backend
export const saveLog = async (logData) => {
  try {
    console.log(logData);
    const { error } = await supabase.from('logs').insert([logData]);
    if (error) throw error;
    return { message: 'Log guardado correctamente' };
  } catch (error) {
    console.error('Error al guardar log:', error.message);
    throw error;
  }
};

// Función para obtener los logs del backend
export const fetchLogs = async () => {
  try {
    const { data, error } = await supabase.from('logs').select('*').order('fecha', { ascending: false });
    if (error) throw error;
     // Convertir las fechas UTC a la hora local de Argentina
     const logsFechaLocal = data.map((log) => {
      const fechaUtc = new Date(log.fecha);
      const fechaLocal = new Date(fechaUtc.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
      return { ...log, fecha: fechaLocal };
    });
    return logsFechaLocal;
  } catch (error) {
    console.error('Error al obtener logs:', error.message);
    throw error;
  }
};