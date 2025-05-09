import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLogged(!!token); // Verifica si el token existe
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };
  const handleLogout = () => {
    // Eliminar el token del almacenamiento local
    localStorage.removeItem('token');
    window.location.reload();
  };

  if (!isLogged) {
    return (
      <div className="home-container">
        <h1>Bienvenido a Calculadora Delivery</h1>
        <p>Por favor, inicia sesión para acceder a las funcionalidades.</p>
        <button
          className="button button-primary"
          onClick={() => handleNavigate('/login')}
        >
          Iniciar Sesión
        </button>
      </div>
    );
  }

  return (
    <div className="home-container">
      <h1>Bienvenido a Calculadora Delivery</h1>
      <p>Gestiona tus precios y direcciones de manera sencilla.</p>

      <div className="home-buttons">
        <button
          className="button button-primary"
          onClick={() => handleNavigate('/calculator')}
        >
          Calculadora
        </button>
        <button
          className="button button-secondary"
          onClick={() => handleNavigate('/logs')}
        >
          Ver Logs
        </button>
        <button
          className="button button-tertiary"
          onClick={handleLogout}
        >
          Cerrar sesion
        </button>
      </div>
    </div>
  );
};

export default Home;