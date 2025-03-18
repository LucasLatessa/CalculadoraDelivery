import React, { useState, useEffect } from "react";
import PriceSettingsModal from "./PriceSettingsModal";
import { obtenerPrecios, actualizarPrecios } from "../services/backend";
import { calcularCuadras } from "../services/maps";
import "../index.css";
import "./home.css";

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
const ORIGEN = "Gral. Pinto 58, Chivilcoy, BA, Argentina";

function Home() {
  const [direccion, setDireccion] = useState("");
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [precios, setPrecios] = useState(null);

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

  const calcularCostoEnvio = (cuadras, precios) => {
    if (cuadras <= 10) return precios["10"];
    if (cuadras <= 15) return precios["15"];
    if (cuadras <= 20) return precios["20"];
    if (cuadras <= 25) return precios["25"];
    return precios["30"];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!direccion.trim()) {
      setError("Ingrese una dirección.");
      return;
    }

    setError("");
    setResultado(null);
    setCargando(true);

    try {
      const destino = direccion.includes("Chivilcoy") ? direccion : `${direccion}, Chivilcoy, BA, Argentina`;
      const [cuadras, destinoInterp] = await calcularCuadras(ORIGEN, destino, API_KEY);
      const costo = calcularCostoEnvio(cuadras, precios);
      
      setResultado({ cuadras, costo, destinoInterp });
    } catch {
      setError("Error al calcular la distancia.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">Calculadora de Envío</h1>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="direccion">Ingrese dirección destino:</label>
            <input
              id="direccion"
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: San Martín 123"
            />
            {error && <div className="error">{error}</div>}
          </div>

          <button type="submit" className="button button-primary" disabled={cargando}>
            Calcular Costo de Envío
          </button>
        </form>

        {cargando && <div className="loader"></div>}

        {resultado && !cargando && (
          <div className="result">
            <p>Cuadras: {resultado.cuadras}</p>
            <p className="cost">Costo de envío: ${resultado.costo}</p>
            <p>Destino Interpretado: {resultado.destinoInterp}</p>
          </div>
        )}

        <button className="button button-secondary" onClick={() => setModalAbierto(true)} style={{ marginTop: "20px" }}>
          Cambiar Costos de Envío
        </button>
      </div>

      {modalAbierto && (
        <PriceSettingsModal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          precios={precios}
          onSave={guardarPrecios}
        />
      )}
    </div>
  );
}

export default Home;
