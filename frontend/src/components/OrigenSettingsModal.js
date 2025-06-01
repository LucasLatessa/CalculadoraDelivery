import React, { useState } from "react";
import { FaTimes } from 'react-icons/fa';
import { obtenerCoordenadas } from "../services/maps";
import styles from "../styles/PriceSettingsModal.module.css";

const OrigenSettingsModal = ({ isOpen, onClose, onSave, origenActual }) => {
  const [direccion, setDireccion] = useState(origenActual.origen_direc);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSave = async () => {
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

        <div className={styles.priceModalRow} style={{ flexDirection: "column", alignItems: "flex-start" }}>
          <label
            htmlFor="direccion"
            className={styles.priceModalLabel}
          >
            Dirección:
          </label>
          <input
            id="direccion"
            type="text"
            placeholder="Ingrese una direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className={styles.priceModalInput}
            style={{ width: "90%" }}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
        {cargando && <p className={styles.loadingMessage}>Obteniendo coordenadas...</p>}

        <div className={styles.priceModalFooter}>
          <button className={styles.priceModalSave} onClick={handleSave} disabled={cargando}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrigenSettingsModal;
