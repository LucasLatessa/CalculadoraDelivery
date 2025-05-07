import React from 'react'
import { FaTimes } from 'react-icons/fa'

function PriceSettingsModal({ isOpen, onClose, precios, onSave }) {
  const [preciosLocal, setPreciosLocal] = React.useState([])

  React.useEffect(() => {
    // Inicializamos los precios con los valores que vienen como parametro
    setPreciosLocal(precios.map(item => ({ ...item })))
  }, [precios])

  const handleInputChange = (index) => (e) => {
    const nuevosPrecios = [...preciosLocal]
    nuevosPrecios[index].precio = e.target.value
    setPreciosLocal(nuevosPrecios)
  }

  const handleSave = () => {
    // Verificamos que ningun precio sea vacio 
    if (preciosLocal.some(p => !p.precio || isNaN(p.precio))) {
      alert("Por favor ingrese todos los precios correctamente.")
      return
    }

    // Convertimos los precios a enteros antes de guardar
    const preciosParseados = preciosLocal.map(p => ({
      cuadras: p.cuadras,
      precio: parseInt(p.precio),
    }))

    onSave(preciosParseados)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <button className="close-button" onClick={onClose}>
          <FaTimes />
        </button>

        <h2>Configurar Precios</h2>

        {preciosLocal.map((item, index) => (
          <div className="form-group" key={item.cuadras}>
            <label>
              Precio  {item.cuadras === 30 ? "mas de 25" : `hasta ${item.cuadras}`} cuadras ($):
            </label>
            <input
              type="number"
              value={item.precio}
              onChange={handleInputChange(index)}
              min="0"
            />
          </div>
        ))}

        <div className="modal-footer">
          <button
            className="button button-primary"
            onClick={handleSave}
            style={{ width: '100%' }}
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

export default PriceSettingsModal
