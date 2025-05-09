import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { iniciarSesion } from '../services/backend';
import "../styles/login.css"

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Llamar a la funcion para iniciar sesion
      const { token } = await iniciarSesion(email, password);

      // Guardar el token en el almacenamiento local
      localStorage.setItem('token', token);

      // Redirigir al usuario a la página principal o dashboard
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas. Por favor, inténtalo de nuevo.');
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar Sesión</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Correo Electrónico:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="button button-primary">
          Iniciar Sesión
        </button>
      </form>
    </div>
  );
};

export default Login;