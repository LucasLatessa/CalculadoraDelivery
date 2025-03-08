import React, { useEffect } from "react";
import { obtenerCoordenadas } from './services/geocoder'
import { calcularCuadras } from './services/routing'
import PriceSettingsModal from './components/PriceSettingsModal'
import { obtenerPrecios, actualizarPrecios } from './services/precios';

// API Keys
const API_KEY_ORS = process.env.REACT_APP_API_KEY_ORS
const API_KEY_GEOCODER = process.env.REACT_APP_API_KEY_GEOCODER
const COORDENADAS_LOCAL = [-60.0210392, -34.9003684]// Pinto 58, Chivilcoy, BA, Argentina(Spezia)
function App() {
  const [direccion, setDireccion] = React.useState("");
  const [resultado, setResultado] = React.useState(null);
  const [error, setError] = React.useState("");
  const [cargando, setCargando] = React.useState(false);
  const [modalAbierto, setModalAbierto] = React.useState(false);
  const [precios, setPrecios] = React.useState(null);
  const [coordLocal, setCoordLocal] = React.useState(COORDENADAS_LOCAL);

  // Función para cargar los precios al iniciar la aplicación
  const cargarPrecios = async () => {
    try {
      const preciosData = await obtenerPrecios(); // Obtiene los precios desde el backend
      setPrecios(preciosData);
    } catch (error) {
      setError("Error al obtener los precios.");
    }
  };
  useEffect(() => {
    cargarPrecios();
  }, []);

  //Guardar precios y recargar
  const guardarPrecios = async (nuevosPrecios) => {
    try {
      await actualizarPrecios(nuevosPrecios);
      await cargarPrecios(); // Recargamos los precios después de guardarlos
      setResultado(null);
    } catch (error) {
      setError("Error al guardar los precios.");
    }
  };
  // Función para calcular el costo de envío
  const calcularCostoEnvio = (cuadras, precios) => {
     // Verificamos el número de cuadras y retornamos el costo correspondiente
    if (cuadras <= 10) {
      return precios["10"]; // 10 cuadras
    } else if (cuadras <= 20) {
      return precios["20"]; // 20 cuadras
    } else {
      return precios["30"]; // 30 cuadras o más
    }
  };

  // Función para manejar el envío del formulario
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Verificamos que se haya ingresado una dirección
  if (!direccion.trim()) {
    setError("Por favor ingrese una dirección");
    return;
  }

  setError(""); // Limpiamos el error anterior
  setResultado(null); // Limpiamos el resultado anterior
  setCargando(true); // Indicamos que estamos cargando

  try {
    // Completamos la dirección con "Chivilcoy, BA, Argentina" si no está incluida
    const direccionCompleta = direccion.includes("Chivilcoy")
      ? direccion
      : `${direccion}, Chivilcoy, BA, Argentina`;

    // Intentamos obtener las coordenadas de la dirección ingresada
    const coordDestino = await obtenerCoordenadas(direccionCompleta, API_KEY_GEOCODER);

    // Si no se obtienen coordenadas, mostramos un error
    if (!coordDestino) {
      setError("No se encontraron coordenadas para la dirección ingresada. Intente con otra dirección.");
      setCargando(false);
      return;
    }

    // Calculamos la cantidad de cuadras entre la ubicación local y el destino
    const cuadras = await calcularCuadras(coordLocal, coordDestino, API_KEY_ORS);

    // Calculamos el costo de envío basado en las cuadras
    const costo = calcularCostoEnvio(cuadras, precios);

    // Mostramos el resultado con la cantidad de cuadras y el costo
    setResultado({ cuadras, costo });
  } catch (err) {
    // Si ocurre un error, mostramos un mensaje genérico de error
    setError(err.message || "Ocurrió un error al calcular la distancia. Verifique la conexión a internet.");
  } finally {
    setCargando(false); // Detenemos el indicador de carga
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

export default App;