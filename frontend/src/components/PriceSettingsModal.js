import React from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import '../styles/PriceSettingsModal.css';

function PriceSettingsModal({ isOpen, onClose, precios, onSave }) {
  const [preciosLocal, setPreciosLocal] = React.useState([]);

  React.useEffect(() => {
    setPreciosLocal(precios.map(item => ({ ...item })));
  }, [precios]);

  const handleInputChange = (index) => (e) => {
    const nuevosPrecios = [...preciosLocal];
    nuevosPrecios[index].precio = e.target.value;
    setPreciosLocal(nuevosPrecios);
  };

  const handleAddPrice = () => {
    setPreciosLocal([...preciosLocal, { cuadras: '', precio: '' }]);
  };

  const handleDeletePrice = (index) => {
    const nuevosPrecios = preciosLocal.filter((_, i) => i !== index);
    setPreciosLocal(nuevosPrecios);
  };

  const handleSave = () => {
    if (preciosLocal.some(p => !p.cuadras || !p.precio || isNaN(p.precio))) {
      alert('Por favor ingrese todos los precios correctamente.');
      return;
    }

    const preciosParseados = preciosLocal.map(p => ({
      id: parseInt(p.id, 10),
      cuadras: parseInt(p.cuadras, 10),
      precio: parseInt(p.precio, 10),
    }));

    onSave(preciosParseados);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="price-modal-backdrop">
      <div className="price-modal">
        <button className="price-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className="price-modal-title">Configurar Precios</h2>

        {preciosLocal.map((item, index) => (
          <div className="price-modal-row" key={index}>
            <label className="price-modal-label">
              Cuadras máx:
              <input
                type="number"
                value={item.cuadras}
                onChange={(e) => {
                  const nuevosPrecios = [...preciosLocal];
                  nuevosPrecios[index].cuadras = e.target.value;
                  setPreciosLocal(nuevosPrecios);
                }}
                min="0"
                className="price-modal-input"
              />
            </label>
            <label className="price-modal-label">
              Precio ($):
              <input
                type="number"
                value={item.precio}
                onChange={handleInputChange(index)}
                min="0"
                className="price-modal-input"
              />
            </label>
            <button
              className="price-modal-delete"
              onClick={() => handleDeletePrice(index)}
            >
              Eliminar
            </button>
          </div>
        ))}

        <button className="price-modal-add" onClick={handleAddPrice}>
          <FaPlus className="price-modal-add-icon" /> Agregar Nuevo Precio
        </button>

        <div className="price-modal-footer">
          <button className="price-modal-save" onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default PriceSettingsModal;