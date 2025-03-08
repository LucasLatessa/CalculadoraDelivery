import { logConsulta } from './backend';

  
  export async function obtenerCoordenadas(direccion, apiKey) {
    try {
      const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(direccion)}&key=${apiKey}&language=es&pretty=1`
      const response = await fetch(url)
      const data = await response.json()
      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        const tipo = result.components._type
        logConsulta(direccion,result)
        // Verificamos si es un edificio
        if (tipo === "building" ) {
          return [result.geometry.lng, result.geometry.lat] // [longitud, latitud]
        } else {
          throw new Error("La dirección proporcionada no corresponde a un domicilio válido.");
        }
      }
      

      throw new Error("No se encontraron resultados para la dirección proporcionada.");
    } catch (error) {
      console.error("Error al obtener coordenadas:", error.message)
      throw error; 
    }
  }
    