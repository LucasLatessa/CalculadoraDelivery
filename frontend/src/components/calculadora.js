import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import { obtenerPrecios, actualizarPrecios, obtenerDirecOrigen, actualizarDirecOrigen, verificarSesion } from "../services/supabaseClient";
import MapaConRuta from "./mapaConRuta";
import PriceSettingsModal from "./PriceSettingsModal";
import OrigenSettingsModal from "./OrigenSettingsModal";
import { obtenerCoordenadas, calcularDistancia } from "../services/maps";
import { FaTrashAlt, FaSearch } from "react-icons/fa";
import styles from "../styles/calculator.module.css";
import { buscarSugerenciasDireccion, calcularRutaOptima} from "../services/maps";

const CIUDAD = ", Chivilcoy, Buenos Aires, Argentina";
const CUADRA_METROS = 100;
const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

function Calculadora() {
  const [direccion, setDireccion] = useState("");
  const [precios, setPrecios] = useState(null);
  const [origen, setOrigen] = useState(null);
  const [modalOrigenAbierto, setModalOrigenAbierto] = useState(false);
  const [modalPreciosAbierto, setModalPreciosAbierto] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");
  const [carrito, setCarrito] = useState([]);
  const [directions, setDirections] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [sugerencias, setSugerencias] = useState([]);
  const [direccionValida, setDireccionValida] = useState(false);
  const libraries = ['places'];
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const logueado = await verificarSesion();
      setIsLogged(logueado);
    };
    checkSession();
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
      if (preciosData.length === 0) {
        setModalPreciosAbierto(true);
      }
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
  const guardarOrigen = async (nuevaUbicacion) => {
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
    if (!direccionValida) {
      setError("Por favor, ingrese una dirección válida.");
      return;
    }
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
  const habldeCalcularRutaOptima = () => {
    const destinos = carrito.map((item) => item.coordenadas);
    calcularRutaOptima(
      origen,
      destinos,
      (response) => setDirections(response),
      (errMsg) => setError(errMsg)
    );
};
  const handleDireccionChange = (e) => {
    const valor = e.target.value;
      setDireccion(valor);
      setDireccionValida(false);
      setSugerencias([]);
      setError("");
    };
  const handleDireccionEnter = (e) => {
    if (e.key === "Enter") {
      buscarSugerenciasDireccion(direccion, setSugerencias);
    }
  };

  const seleccionarDireccion = (item) => {
    setDireccion(item.description);
    setDireccionValida(true);
    setSugerencias([]);
  };

  if (!isLogged) {
    return (
      <div style={{ textAlign: "center", marginTop: "4rem" }}>
        <h2>Debes iniciar sesión para usar la calculadora</h2>
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          style={{ marginTop: "2rem" }}
          onClick={() => navigate("/login")}
        >
          Ir al login
        </button>
      </div>
    );
  }

  return (
    <div className={styles.app}>
      <div className={styles.configButtonContainer}>
        <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => setModalPreciosAbierto(true)}>
          Cambiar Costos de Envio
        </button>
        <button className={`${styles.button} ${styles.buttonSecondary}`} onClick={() => setModalOrigenAbierto(true)}>
          Cambiar Direccion de Origen
        </button>
      </div>
      <LoadScript
        googleMapsApiKey={API_KEY}
        libraries={libraries}
      >
        <div className={styles.container}>
          <h1 className={styles.title}>Calcular costo de envio</h1>
          <div className={styles.formGroup}>
            <label htmlFor="direccion">Ingrese dirección destino:</label>
            <div style={{ position: "relative", width: "100%" }}>
              <button
                type="button"
                onClick={() => buscarSugerenciasDireccion(direccion, setSugerencias)}
                className={styles.searchButton}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  left: 4,
                  top: "50%",
                  transform: "translateY(-55%)",
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  zIndex: 2,
                  color: "#007bff",
                  fontSize: "1.1em",
                  width: "2em",
                  height: "2em",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
                aria-label="Buscar dirección"
              >
                <FaSearch />
              </button>
              <input
                id="direccion"
                type="text"
                autoComplete="off"
                placeholder="San Martín 123"
                value={direccion}
                onChange={handleDireccionChange}
                onKeyDown={handleDireccionEnter}
                style={{ paddingLeft: "2em" }}
              />
              {sugerencias.length > 0 && (
                <ul className={styles.suggestionsList}>
                  {sugerencias.map((item) => (
                    <li
                      key={item.place_id}
                      onClick={() => seleccionarDireccion(item)}
                      className={styles.suggestionItem}
                    >
                      {item.description}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button onClick={handleCalcular} className={`${styles.button} ${styles.buttonPrimary}`} disabled={cargando}>
            Calcular costo
          </button>
          {error && <p className={styles.error}>{error}</p>}
          {cargando && <div className={styles.loader}></div>}
          {resultado && !cargando && (
            <div className={styles.result}>
              <p>Cuadras: {resultado.cuadras}</p>
              <p>Costo estimado: ${resultado.costo}</p>
              <button className={styles.buttonAgregar} onClick={agregarAlRecorrido}>Agregar al recorrido</button>
            </div>
          )}
          {/* Mostrar el recorrido/carrito */}
          {carrito.length > 0 && (
            <div className={styles.recorrido}>
              <h3>Recorrido:</h3>
              <ul>
                {carrito.map((item, index) => (
                  <li key={index} className={styles.carritoItem}>
                    {item.direccion} - Cuadras: {item.cuadras} - Costo: ${item.costo}
                    <button
                      className={styles.btnEliminar}
                      onClick={() => eliminarDelCarrito(index)}
                      title="Eliminar"
                    >
                      <FaTrashAlt />
                    </button>
                  </li>
                ))}
              </ul>
              <button className={styles.buttonOptimizar} onClick={habldeCalcularRutaOptima}>Armar recorrido</button>
            </div>
          )}
        </div>
        {/* Mostrar el mapa con la ruta optimizada */}
        <MapaConRuta directions={directions} />
      </LoadScript>

      {modalPreciosAbierto && (
        <PriceSettingsModal
          isOpen={modalPreciosAbierto}
          onClose={() => setModalPreciosAbierto(false)}
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