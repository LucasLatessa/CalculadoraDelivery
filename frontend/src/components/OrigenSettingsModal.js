import React, { useState } from "react";
import { obtenerCoordenadas } from "../services/maps";

const OrigenSettingsModal = ({ isOpen, onClose, onSave, origenActual }) => {
  const [direccion, setDireccion] = useState(origenActual.origen_direc);
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(false);

  const handleSave = async () => {
    setError("");
    setCargando(true);
    try {
      const coordenadas = await obtenerCoordenadas(direccion); // Llama a la función para obtener coordenadas
      const origenData = {
        origen_direc: direccion, 
        origen_lat: coordenadas.lat(), 
        origen_lng: coordenadas.lng(), 
      };
      onSave(origenData);
      onClose(); // Cierra el modal
    } catch (err) {
      setError("No se pudo obtener las coordenadas. Verifique la dirección ingresada.");
    } finally {
      setCargando(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h2>Cambiar Ubicación de Origen</h2>
        <div className="form-group">
          <label htmlFor="direccion">Dirección:</label>
          <input
            id="direccion"
            type="text"
            placeholder="Ingrese una dirección"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="direccion-input"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {cargando && <p className="loading-message">Obteniendo coordenadas...</p>}
        <button className="button button-primary" onClick={handleSave} disabled={cargando}>
          Guardar
        </button>
        <button className="button button-secondary" onClick={onClose} disabled={cargando}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default OrigenSettingsModal;