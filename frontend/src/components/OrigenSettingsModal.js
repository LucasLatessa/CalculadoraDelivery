import React, { useState } from "react";
import { FaTimes } from 'react-icons/fa';
import { obtenerCoordenadas } from "../services/maps";
import '../styles/PriceSettingsModal.css'; // Asegurate de importar los estilos

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
    <div className="price-modal-backdrop">
      <div className="price-modal">
        <button className="price-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className="price-modal-title">Cambiar Ubicacion de Origen</h2>

        <div className="form-group">
          <label htmlFor="direccion">Direccion:</label>
          <input
            id="direccion"
            type="text"
            placeholder="Ingrese una direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="direccion-input"
          />
        </div>

        {error && <p className="error-message">{error}</p>}
        {cargando && <p className="loading-message">Obteniendo coordenadas...</p>}

        <div className="price-modal-footer">
          <button className="price-modal-save" onClick={handleSave} disabled={cargando}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrigenSettingsModal;
