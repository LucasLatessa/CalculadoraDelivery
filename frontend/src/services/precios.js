// Función para obtener los precios desde el servidor
export const obtenerPrecios = async () => {
    try {
      //const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/precios`);
      const response = await fetch(`https://calculadoradelivery-production.up.railway.app/precios`);
      
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
      //const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/precios`, {
      const response = await fetch(`https://calculadoradelivery-production.up.railway.app/precios`, {
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
  