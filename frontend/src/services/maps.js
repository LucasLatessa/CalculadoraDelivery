import {logConsulta } from "../services/supabaseClient";

/* Geocodifica una direccion y devuelve las coordenadas (latitud y longitud). */
export async function  obtenerCoordenadas ( direccion) {
      return new Promise((resolve, reject) => {
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ address: direccion }, (results, status) => {
          if (status === "OK") {
            const geocodeData = {
              direccion_ingresada: direccion,
              direccion_geocodificada: results[0].formatted_address,
              coordenadas: results[0].geometry.location,
              tipo_ubicacion: results[0].types.join(", "),
              status: "exitosa",
            };
            //logConsulta(direccion, geocodeData);
            resolve(results[0].geometry.location)
          } else {
            const geocodeError = {
              direccion_ingresada: direccion,
              status: "error",
              error: "No se pudo geocodificar la direccion",
            };
            //logConsulta(direccion, geocodeError);
            reject(new Error("No se pudo geocodificar la direccion"))
          }
        })
      })
    }

/*  Calcula la distancia entre dos ubicaciones (origen y destino) en metros */
export async function calcularDistancia (origen, destino) {
          return new Promise((resolve, reject) => {
            const service = new window.google.maps.DistanceMatrixService()
            service.getDistanceMatrix(
              {
                origins: [origen],
                destinations: [destino],
                travelMode: window.google.maps.TravelMode.DRIVING,
                unitSystem: window.google.maps.UnitSystem.METRIC,
              },
              (response, status) => {
                if (status === "OK") {
                  const metros = response.rows[0].elements[0].distance.value
                  resolve(metros)
                } else {
                  reject(new Error("Error al calcular distancia"))
                }
              }
            )
          })
        }