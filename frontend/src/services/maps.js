export async function calcularCuadras(origen, destino, apiKey) {
    try {
        const directionsUrl = `https://routes.googleapis.com/directions/v2:computeRoutes`;
        const response = await fetch(directionsUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": apiKey,
                "X-Goog-FieldMask": "routes.distanceMeters,routes.legs.startLocation,routes.legs.endLocation"
            },
            body: JSON.stringify({
                origin: { address: origen },
                destination: { address: destino },
                travelMode: "DRIVE"
            })
        });

        const data = await response.json();
        console.log("Respuesta completa:", data);

        if (!data.routes || data.routes.length === 0) {
            console.error("No se encontraron rutas.");
            return { cuadras: null, direccionDestino: "No disponible" };
        }

        const route = data.routes[0];
        const distanciaMetros = route.distanceMeters || 0;
        const cuadras = Math.round(distanciaMetros / 100);

        const endLocation = route.legs?.[0]?.endLocation.latLng;
        
        // Si hay coordenadas, buscamos la dirección con Geocoding API
        let direccionDestino = "No disponible";
        if (endLocation) {
            direccionDestino = await obtenerDireccion(endLocation.latitude, endLocation.longitude, apiKey);
        }


        return [cuadras, direccionDestino];
    } catch (error) {
        console.error("Error al calcular las cuadras:", error);
        return [null, null]; ;
    }
}

// Función para obtener dirección desde coordenadas con Geocoding API
async function obtenerDireccion(lat, lng, apiKey) {
    try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        const response = await fetch(geocodeUrl);
        const data = await response.json();

        if (data.status === "OK" && data.results.length > 0) {
            return data.results[0].formatted_address; // Dirección más relevante
        } else {
            console.warn("No se encontró dirección para las coordenadas.");
            return "Dirección no encontrada";
        }
    } catch (error) {
        console.error("Error al obtener la dirección:", error);
        return "Error obteniendo dirección";
    }
}
