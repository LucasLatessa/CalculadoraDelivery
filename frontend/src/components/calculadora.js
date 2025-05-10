import React, { useState, useEffect } from "react";
import { LoadScript} from "@react-google-maps/api"
import { obtenerPrecios, actualizarPrecios, obtenerDirecOrigen, actualizarDirecOrigen } from "../services/supabaseClient";
import MapaConRuta from "./mapaConRuta"
import PriceSettingsModal from "./PriceSettingsModal";
import OrigenSettingsModal from "./OrigenSettingsModal";
import { obtenerCoordenadas, calcularDistancia } from "../services/maps"
import { FaTrashAlt } from "react-icons/fa"
import "./home.css"

const CIUDAD = ", Chivilcoy, Buenos Aires, Argentina"
const CUADRA_METROS = 100
const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function Calculadora() {
    const [direccion, setDireccion] = useState("")
    const [precios, setPrecios] = useState(null);
    const [origen, setOrigen] = useState(null);
    const [modalOrigenAbierto, setModalOrigenAbierto] = useState(false); // Estado para el modal de origen
    const [modalAbierto, setModalAbierto] = useState(false);
    const [resultado, setResultado] = useState(null)
    const [cargando, setCargando] = useState(false)
    const [error, setError] = useState("")
    const [carrito, setCarrito] = useState([])
    const [directions, setDirections] = useState(null) 
    const libraries = ['places']; 
    useEffect(() => {
        cargarPrecios();
        cargarOrigen();
      }, []);
    
      const cargarOrigen = async () => {
        try {
          const origen = await obtenerDirecOrigen(); 
          setOrigen(origen);
        } catch {
          setError("Error al obtener la direccion origen.");
        }
      }
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
      const guardarOrigen =async (nuevaUbicacion) => {
        try {
          await actualizarDirecOrigen(nuevaUbicacion);
          await cargarOrigen();
          setResultado(null);
        } catch {
          setError("Error al guardar los precios.");
        }
      };
    const calcularCostoEnvio = (cuadras, precios) => {
      for (let i = 0; i < precios.length; i++) {
        if (cuadras <= precios[i].cuadras) {
          return precios[i].precio;
        }
      }
      return precios[precios.length - 1].precio; 
    };
    const handleCalcular = async () => {
      setCargando(true)
      setError("")
      setResultado(null)
  
      try {
        const direccionCompleta = direccion.trim() + CIUDAD
        const destino = await obtenerCoordenadas(direccionCompleta)
        const origenCoordenadas = { 
          lat: parseFloat(origen.origen_lat), 
          lng: parseFloat(origen.origen_lng) 
        };
        const metros = await calcularDistancia(origenCoordenadas, destino)
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
    const eliminarDelCarrito = (index) => {
      setCarrito((prevCarrito) => prevCarrito.filter((_, i) => i !== index))
    }    

    // Funcion para calcular la ruta optimizada
    const calcularRutaOptima = () => {
        const destinos = carrito.map((item) => item.coordenadas)
        
        // Usamos DirectionsService para calcular el recorrido optimizado
        const directionsService = new window.google.maps.DirectionsService()
        const origenCoordenadas = { 
          lat: parseFloat(origen.origen_lat), 
          lng: parseFloat(origen.origen_lng) 
        };
        // Solicitar la ruta optimizada con los destinos
        directionsService.route(
        {
            origin: origenCoordenadas,
            destination:origenCoordenadas,
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
                <button className="button button-secondary" onClick={() => setModalOrigenAbierto(true)}>
                  Cambiar Direccion de Origen
                </button>
             </div>
            <LoadScript
                googleMapsApiKey={API_KEY}
                libraries={libraries}
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
                        <li key={index} className="carrito-item">
                          {item.direccion} - Cuadras: {item.cuadras} - Costo: ${item.costo}
                          <button
                            className="btn-eliminar"
                            onClick={() => eliminarDelCarrito(index)}
                            title="Eliminar"
                          >
                          <FaTrashAlt />
                          </button>
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
      {modalOrigenAbierto && (
          <OrigenSettingsModal
            isOpen={modalOrigenAbierto}
            onClose={() => setModalOrigenAbierto(false)}
            onSave={guardarOrigen}
            origenActual={origen}
          />
        )}
    </div>
    )
  }
  
  export default Calculadora