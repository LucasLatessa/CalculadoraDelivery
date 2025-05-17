import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/supabaseClient';
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
      await login(email, password);
      const parsedToken = JSON.parse(localStorage.getItem('sb-vyftfmscngedshlqrqfm-auth-token'));
      const access_token = parsedToken?.access_token;
      if (access_token) { 
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
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