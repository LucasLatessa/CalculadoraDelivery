import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/supabaseClient';
import styles from "../styles/login.module.css";

const Login = () => {
  const [correo_electronico, setCorreoElectronico] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!correo_electronico || !contrasena) {
      setError('Por favor ingrese todos los campos');
      return;
    }

    try {
      await login( correo_electronico, contrasena);
      window.location.href = '/calculator';
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className={styles.loginContainer}>
  <h2 className={styles.loginTitle}>Iniciar sesión</h2>
  <form onSubmit={handleSubmit} className={styles.loginForm}>
    <div className={styles.loginGroup}>
      <label htmlFor="correoElectronico" className={styles.loginLabel}>Correo Electrónico</label>
      <input
        type="email"
        id="correoElectronico"
        value={correo_electronico}
        onChange={(e) => setCorreoElectronico(e.target.value)}
        required
        className={styles.loginInput}
      />
    </div>
    <div className={styles.loginGroup}>
      <label htmlFor="contrasena" className={styles.loginLabel}>Contraseña</label>
      <input
        type="password"
        id="contrasena"
        value={contrasena}
        onChange={(e) => setContrasena(e.target.value)}
        required
        className={styles.loginInput}
      />
    </div>
    {error && <p className={styles.loginError}>{error}</p>}
    <button type="submit" className={styles.loginButton}>Iniciar sesión</button>
  </form>
  <div className={styles.loginFooter}>
        ¿No tienes cuenta? Solicítala a tu administrador.<br/>
        <span style={{color:'#aaa'}}>Delivery Smart &copy; {new Date().getFullYear()}</span>
      </div>
</div>
  );
};

export default Login;
