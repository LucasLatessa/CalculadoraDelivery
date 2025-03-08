export async function calcularCuadras(coord1, coord2, apiKey) {
    try {
      // Verificar si las coordenadas son iguales
      if (coord1[0] === coord2[0] && coord1[1] === coord2[1]) {
        return 0 // Distancia 0 cuadras
      }
  
      const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}`
      const body = {
        coordinates: [coord1, coord2],
        format: "geojson",
      }
  
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
      })
  
      const data = await response.json()
  
      // Extraer la distancia en metros
      const distanciaMetros = data.routes[0].summary.distance
 
      // Aproximamos 1 cuadra = 100 metros
      const cuadras = Math.round(distanciaMetros / 100)
  
      return cuadras
    } catch (error) {
      console.error("Error al calcular cuadras:", error)
      return 0 // En caso de error, retornamos 0 cuadras
    }
  }
  