import React from 'react';
import { FaTimes } from 'react-icons/fa'; // Importamos el ícono de la cruz de react-icons

function PriceSettingsModal({ isOpen, onClose, precios, onSave }) {
  // Establecemos los valores iniciales de precios basados en las claves dinámicas
  const [preciosLocal, setPreciosLocal] = React.useState({
    "10": precios["10"] || "",
    "15": precios["15"] || "",
    "20": precios["20"] || "",
    "25": precios["25"] || "",
    "30": precios["30"] || ""
  });

  // Función para manejar los cambios en los inputs
  const handleInputChange = (key) => (e) => {
    setPreciosLocal({
      ...preciosLocal,
      [key]: e.target.value
    });
  };

  const handleSave = () => {
    // Verificar si todos los valores son válidos
    if (!preciosLocal["10"] || !preciosLocal["15"] || !preciosLocal["20"] || !preciosLocal["25"] || !preciosLocal["30"]) {
      alert("Por favor ingrese valores válidos para todos los campos.");
      return;
    }

    // Guardar los precios modificados
    onSave({
      "10": Number.parseInt(preciosLocal["10"]),
      "15": Number.parseInt(preciosLocal["15"]),
      "20": Number.parseInt(preciosLocal["20"]),
      "25": Number.parseInt(preciosLocal["25"]),
      "30": Number.parseInt(preciosLocal["30"]),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      {console.log(preciosLocal)}
      <div className="modal">
        {/* Botón de cierre en la parte superior */}
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>

        <h2>Configurar Precios</h2>

        <div className="form-group">
          <label>Precio hasta 10 cuadras ($):</label>
          <input
            type="number"
            value={preciosLocal["10"]}
            onChange={handleInputChange("10")}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Precio hasta 15 cuadras ($):</label>
          <input
            type="number"
            value={preciosLocal["15"]}
            onChange={handleInputChange("15")}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Precio hasta 20 cuadras ($):</label>
          <input
            type="number"
            value={preciosLocal["20"]}
            onChange={handleInputChange("20")}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Precio hasta 25 cuadras ($):</label>
          <input
            type="number"
            value={preciosLocal["25"]}
            onChange={handleInputChange("25")}
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Precio para más de 25 cuadras ($):</label>
          <input
            type="number"
            value={preciosLocal["30"]}
            onChange={handleInputChange("30")}
            min="0"
          />
        </div>

        <div className="modal-footer">
          <button
            className="button button-primary"
            onClick={handleSave}
            style={{ width: '100%' }} // Aseguramos que el botón de guardar ocupe todo el ancho
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default PriceSettingsModal;
