import React, { useState, useEffect } from "react";
import { obtenerCoordenadas } from "../services/geocoder";
import { obtenerRecorridoOptimizado } from "../services/routing";
import MapaRecorrido  from "./mapaRecorrido"

const API_KEY_GEOCODER = process.env.REACT_APP_API_KEY_GEOCODER
const COORDENADAS_LOCAL = [-60.0210392, -34.9003684]; // Pinto 58, Chivilcoy, BA, Argentina (Spezia)
const Recorrido = () => {
  const [direcciones, setDirecciones] = useState([""]);
  const [recorrido, setRecorrido] = useState(null);
  const [paradas, setParadas] = useState(null);
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

  // Enviar formulario y optimizar recorrido
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setRecorrido(null);
    setCargando(true);
    try {
      // Convertir direcciones a coordenadas
      const coordenadas = await Promise.all(
        direcciones.map(async (direccion) => {
          if (!direccion.trim()) return null;
          return await obtenerCoordenadas(direccion, API_KEY_GEOCODER);
        })
      );
      if (coordenadas.length === 0) {
        setError("No se encontraron direcciones válidas.");
        setCargando(false);
        return;
      }
      // Agregar la coordenada del local
      coordenadas.unshift(COORDENADAS_LOCAL);

      // Obtener recorrido optimizado
      const resultado = await obtenerRecorridoOptimizado(coordenadas);
      const ruta = resultado.ruta.map(([lon, lat]) => [lat, lon]); // Convertir coordenadas para Leaflet
      setRecorrido(ruta);
      setParadas(coordenadas);
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
          <button type="button" className="button button-secondary" onClick={agregarDireccion}>
            Agregar Dirección
          </button>
        )}

        <button type="submit" className="button button-primary" disabled={cargando}>
          Crear Recorrido
        </button>
      </form>

      {cargando && <div className="loader"></div>}
      {error && <div className="error">{error}</div>}

    </div>
    <MapaRecorrido recorrido={recorrido} paradas={paradas} />
  </>
  );
};

export default Recorrido;
