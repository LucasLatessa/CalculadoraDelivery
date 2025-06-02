import React, { useState, useEffect, useRef} from "react";
import { FaTimes, FaSearch } from 'react-icons/fa';
import { obtenerCoordenadas, buscarSugerenciasDireccion } from "../services/maps";
import styles from "../styles/PriceSettingsModal.module.css";

const OrigenSettingsModal = ({ isOpen, onClose, onSave, origenActual }) => {
  const [direccion, setDireccion] = useState(origenActual.origen_direc);
  const [direccionValida, setDireccionValida] = useState(false);
  const [error, setError] = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [cargando, setCargando] = useState(false);
  const autocompleteService = useRef(null);

  useEffect(() => {
    if (!autocompleteService.current && window.google) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
    }
  }, []);
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
    setDireccionValida(true); // Marca como válida solo si selecciona una sugerencia
    setSugerencias([]);
  };

  const handleSave = async () => {
    if (!direccionValida) {
      setError("Por favor, ingrese una dirección válida.");
      return;
    }
    setError("");
    setCargando(true);
    try {
      const coordenadas = await obtenerCoordenadas(direccion);
      const origenData = {
        origen_direc: direccion,
        origen_lat: coordenadas.lat(),
        origen_lng: coordenadas.lng(),
      };
      onSave(origenData);
      onClose();
    } catch (err) {
      setError("No se pudo obtener las coordenadas. Verifique la direccion ingresada.");
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.priceModalBackdrop}>
      <div className={styles.priceModal}>
        <button className={styles.priceModalClose} onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className={styles.priceModalTitle}>Cambiar Ubicacion de Origen</h2>

        <div className={styles.priceModalRow} style={{ flexDirection: "column", alignItems: "flex-start", position: "relative" }}>
          <label
            htmlFor="direccion"
            className={styles.priceModalLabel}
          >
            Dirección:
          </label>
          <div style={{ position: "relative", width: "90%" }}>
            <button
              type="button"
              onClick={() =>buscarSugerenciasDireccion(direccion, setSugerencias)}
              className={styles.searchButton}
              tabIndex={-1}
              style={{
                position: "absolute",
                left: 15,
                top: "50%",
                transform: "translateY(-40%)",
                background: "none",
                fontSize: "1.1rem",  
                border: "none",
                padding: 0,
                cursor: "pointer",
                zIndex: 2,
                color: "#007bff"
              }}
              aria-label="Buscar dirección"
            >
              <FaSearch />
            </button>
            <input
              id="direccion"
              type="text"
              placeholder="Ingrese una direccion"
              value={direccion}
              onChange={handleDireccionChange}
              onKeyDown={handleDireccionEnter}
              className={styles.priceModalInput}
              autoComplete="off"
              style={{ width: "100%", paddingLeft: "2em" }}
            />
          </div>
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

        {error && <p className={styles.error}>{error}</p>}
        {cargando && <p className={styles.loadingMessage}>Obteniendo coordenadas...</p>}

        <button className={styles.priceModalSave} onClick={handleSave} disabled={cargando}>
          Guardar
        </button>
      </div>
    </div>
  );
};

export default OrigenSettingsModal;
