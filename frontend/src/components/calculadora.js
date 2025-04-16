import React, { useState, useEffect } from "react";
import { LoadScript, GoogleMap, Marker, DirectionsRenderer } from "@react-google-maps/api"
import { obtenerPrecios, actualizarPrecios } from "../services/backend";
import MapaConRuta from "./mapaConRuta"
import PriceSettingsModal from "./PriceSettingsModal";

const ORIGEN_COORDENADAS = { lat: -34.9003698, lng: -60.0210871 } // Gral. Pinto 58, Chivilcoy
const CIUDAD = ", Chivilcoy, Buenos Aires, Argentina"
const CUADRA_METROS = 100
const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function Calculadora() {
    const [direccion, setDireccion] = useState("")
    const [precios, setPrecios] = useState(null);
    const [modalAbierto, setModalAbierto] = useState(false);
    const [resultado, setResultado] = useState(null)
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState("")
    const [carrito, setCarrito] = useState([])
    const [directions, setDirections] = useState(null) 
    
    useEffect(() => {
        cargarPrecios();
      }, []);
    
    const cargarPrecios = async () => {
        try {
          const preciosData = await obtenerPrecios();
          setPrecios(preciosData);
        } catch {
          setError("Error al obtener los precios.");
        }
    };

    const guardarPrecios = async (nuevosPrecios) => {
        try {
          await actualizarPrecios(nuevosPrecios);
          await cargarPrecios();
          setResultado(null);
        } catch {
          setError("Error al guardar los precios.");
        }
      };

    const geocode = (direccion) => {
      return new Promise((resolve, reject) => {
        const geocoder = new window.google.maps.Geocoder()
        geocoder.geocode({ address: direccion }, (results, status) => {
          if (status === "OK") {
            resolve(results[0].geometry.location)
          } else {
            reject(new Error("No se pudo geocodificar la direccion"))
          }
        })
      })
    }
  
    const calcularDistancia = (origen, destino) => {
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
    const calcularCostoEnvio = (cuadras, precios) => {
        if (cuadras <= 10) return precios["10"];
        if (cuadras <= 15) return precios["15"];
        if (cuadras <= 20) return precios["20"];
        if (cuadras <= 25) return precios["25"];
        return precios["30"];
      };
    const handleCalcular = async () => {
      setCargando(true)
      setError("")
      setResultado(null)
  
      try {
        const direccionCompleta = direccion.trim() + CIUDAD
        const destino = await geocode(direccionCompleta)
  
        const metros = await calcularDistancia(ORIGEN_COORDENADAS, destino)
        const cuadras = Math.ceil(metros / CUADRA_METROS)
        const costo = calcularCostoEnvio(cuadras, precios);
  
        setResultado({ cuadras, costo, coordenadas: destino })
      } catch (err) {
        setError(err.message)
      } finally {
        setCargando(false)
      }
    }
  
    // Funcion para agregar direccion al carrito
    const agregarAlRecorrido = () => {
      if (resultado) {
        setCarrito((prevCarrito) => [
          ...prevCarrito,
          { direccion: direccion.trim(), ...resultado },
        ])
      }
    }

    // Funcion para calcular la ruta optimizada
    const calcularRutaOptima = () => {
        const destinos = carrito.map((item) => item.coordenadas)
        
        // Usamos DirectionsService para calcular el recorrido optimizado
        const directionsService = new window.google.maps.DirectionsService()
        
        // Solicitar la ruta optimizada con los destinos
        directionsService.route(
        {
            origin: ORIGEN_COORDENADAS,
            destination:ORIGEN_COORDENADAS,
            waypoints: destinos.map((coordenada) => ({
                location: coordenada,
                stopover: true,
            })),
            travelMode: window.google.maps.TravelMode.DRIVING,
            optimizeWaypoints: true,
        },
        (response, status) => {
            if (status === "OK") {
                setDirections(response)
            } else {
                setError("Error al calcular la ruta")
            }
        }
        )
    }
  
    return (
        <div className="app">
             <div className="config-button-container">
                <button className="button button-secondary" onClick={() => setModalAbierto(true)}>
                Cambiar Costos de Envio
                </button>
             </div>
            <LoadScript
                googleMapsApiKey={API_KEY}
                libraries={["places", "directions"]}
            >
            <div className="container">
                <h1 className="title">Calcular costo de envio</h1>
                <div className="form-group">
                    <label htmlFor="direccion">Ingrese dirección destino:</label>
                    <input
                        id="direccion"
                        type="text"
                        placeholder="San Martín 123"
                        value={direccion}
                        onChange={(e) => setDireccion(e.target.value)}
                    />
                </div>
                <button onClick={handleCalcular}className="button button-primary" disabled={cargando}>
                    Calcular costo
                </button>
                {error && <p className="error">{error}</p>}
                {cargando && <div className="loader"></div>}
                {resultado && !cargando && (
                    <div className="result">
                    <p>Cuadras: {resultado.cuadras}</p>
                    <p>Costo estimado: ${resultado.costo}</p>
                    <button className="button-agregar" onClick={agregarAlRecorrido}>Agregar al recorrido</button>
                    </div>
                )}
                {/* Mostrar el recorrido/carrito */}
                {carrito.length > 0 && (
                    <div className="recorrido">
                    <h3>Recorrido:</h3>
                    <ul>
                        {carrito.map((item, index) => (
                        <li key={index}>
                            {item.direccion} - Cuadras: {item.cuadras} - Costo: ${item.costo}
                        </li>
                        ))}
                    </ul>
                    <button className="button-optimizar" onClick={calcularRutaOptima}>Calcular recorrido</button>
                    </div>
                )}
            </div>
            {/* Mostrar el mapa con la ruta optimizada */}
            <MapaConRuta directions={directions} />
            </LoadScript>
        
        {modalAbierto && (
        <PriceSettingsModal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          precios={precios}
          onSave={guardarPrecios}
        />
      )}
    </div>
    )
  }
  
  export default Calculadora