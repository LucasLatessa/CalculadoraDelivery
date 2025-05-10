import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signUp } from '../services/supabaseClient';
import { obtenerCoordenadas } from '../services/maps';
import { LoadScript} from "@react-google-maps/api"
import '../styles/login.css';
const CIUDAD = ", Chivilcoy, Buenos Aires, Argentina"
const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
 
const SignUp = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [direccion, setDireccion] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const libraries = ['places']; 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const direccionCompleta = direccion.trim() + CIUDAD
      const coords = await obtenerCoordenadas(direccionCompleta);

      const origenData = {
        origen_direc: direccionCompleta,
        origen_lat: coords.lat(),
        origen_lng: coords.lng()
      };

      await signUp(email, password, origenData);

      // Redirigir al login luego del registro
      navigate('/login');
    } catch (err) {
      setError('No se pudo registrar. Verifique la direccion o los datos ingresados.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Registrarse</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo Electronico:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contrasena:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="direccion">Direccion de origen:</label>
          <input
            type="text"
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        {cargando && <p className="loading-message">Registrando usuario...</p>}
        <button type="submit" className="button button-primary" disabled={cargando}>
          Registrarse
        </button>
      </form>
      <LoadScript
                googleMapsApiKey={API_KEY}
                libraries={libraries}
            >

            </LoadScript>
        
    </div>
  );
};

export default SignUp;
