import React, { useState, useEffect } from "react";
import { obtenerRecorrido } from "../services/backend";
import MapaRecorrido  from "./mapaRecorrido"

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const ORIGEN = "Gral. Pinto 58, Chivilcoy, BA, Argentina";

const Recorrido = () => {
  const [direcciones, setDirecciones] = useState([""]);
  const [recorrido, setRecorrido] = useState(null);
  const [distancia, setDistancia] = useState(null);
  const [paradas, setParadas] = useState(null);
  const [duracionMinutos, setDuracionMinutos] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  // Agregar nueva dirección (máximo 10)
  const agregarDireccion = () => {
    if (direcciones.length < 10) {
      setDirecciones([...direcciones, ""]);
    }
  };

  // Manejar cambio en los inputs de direcciones
  const handleDireccionChange = (index, value) => {
    const nuevasDirecciones = [...direcciones];
    nuevasDirecciones[index] = value;
    setDirecciones(nuevasDirecciones);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setRecorrido([]); // Limpiar recorrido antes de cargar el nuevo
    setParadas([]);
    setDistancia(null);
    setCargando(true);
    setDuracionMinutos(null);
  
    try {
      const direccionesValidas = direcciones
        .map((direccion) => {
          const direccionLimpia = direccion.trim();
          return direccionLimpia.length > 0
            ? direccionLimpia.includes("Chivilcoy")
              ? direccionLimpia
              : `${direccionLimpia}, Chivilcoy, BA, Argentina`
            : null;
        })
        .filter((direccion) => direccion !== null);
  
      direccionesValidas.unshift(ORIGEN);
      
      // Obtener la ruta optimizada
      const { distanciaTotal, rutaCoordenadas, paradas,duracionMinutos } = await obtenerRecorrido(direccionesValidas);
  
      setRecorrido(rutaCoordenadas);
      setParadas(paradas);
      setDistancia(distanciaTotal);
      setDuracionMinutos(duracionMinutos);
    } catch (err) {
      setError("Error al calcular el recorrido.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <>
    <div className="container">
      <h2 className="title">Optimización de Recorrido</h2>

      <form onSubmit={handleSubmit}>
        {direcciones.map((direccion, index) => (
          <div className="form-group" key={index}>
            <label>Dirección {index + 1}:</label>
            <input
              type="text"
              value={direccion}
              onChange={(e) => handleDireccionChange(index, e.target.value)}
              placeholder="Ej: San Martín 123"
            />
          </div>
        ))}

        {direcciones.length < 10 && (
          <button type="button" style={{ margin: "1rem" }} className="button button-secondary" onClick={agregarDireccion}>
            Agregar Dirección
          </button>
        )}

        <button type="submit" className="button button-primary" disabled={cargando}>
          Crear Recorrido
        </button>
      </form>

      {cargando && <div className="loader"></div>}
      {error && <div className="error">{error}</div>}
      {distancia && <div className="">{`Distancia de recorrido: ${distancia}m`}</div>}
      {duracionMinutos && <div className="">{`Duracion: ${duracionMinutos}min`}</div>}
      
    </div>
    <div className="map-container">
      <MapaRecorrido recorrido={recorrido}  paradas={paradas} />
    </div>
    </>
  );
};

export default Recorrido;
