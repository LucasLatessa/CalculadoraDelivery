import React from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import styles from '../styles/PriceSettingsModal.module.css';

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
    <div className={styles.priceModalBackdrop}>
      <div className={styles.priceModal}>
        <button className={styles.priceModalClose} onClick={onClose}>
          <FaTimes />
        </button>

        <h2 className={styles.priceModalTitle}>Configurar Precios</h2>

        {preciosLocal.map((item, index) => (
          <div className={styles.priceModalRow} key={index}>
            <label className={styles.priceModalLabel}>
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
                className={styles.priceModalInput}
              />
            </label>
            <label className={styles.priceModalLabel}>
              Precio ($):
              <input
                type="number"
                value={item.precio}
                onChange={handleInputChange(index)}
                min="0"
                className={styles.priceModalInput}
              />
            </label>
            <button
              className={styles.priceModalDelete}
              onClick={() => handleDeletePrice(index)}
            >
              Eliminar
            </button>
          </div>
        ))}

        <button className={styles.priceModalAdd} onClick={handleAddPrice}>
          <FaPlus className={styles.priceModalAddIcon} /> Agregar Nuevo Precio
        </button>

        <div className={styles.priceModalFooter}>
          <button className={styles.priceModalSave} onClick={handleSave}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

export default PriceSettingsModal;