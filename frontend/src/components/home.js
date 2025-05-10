import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, verificarSesion } from "../services/supabaseClient";

const Home = () => {
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const logueado = await verificarSesion();
      setIsLogged(logueado);
    };

    checkSession();
  }, []);

  const handleNavigate = (path) => {
    navigate(path);
  };
  const handleLogout = async() => {
    await logout();
    window.location.reload();
  };
 if (!isLogged) {
    return (
      <main>
        <h1 className="home-title">Bienvenido a Calculadora Delivery</h1>
        <p className="home-description">
          Por favor, inicia sesión para acceder a las funcionalidades.
        </p>
        <button
          className="button button-primary"
          onClick={() => handleNavigate('/login')}
        >
          Iniciar Sesión
        </button>
      </main>
    );
  }

  return (
    <main >
      <h1 className="home-title">Bienvenido a Calculadora Delivery</h1>
      <p className="home-description">
        Gestiona tus precios y direcciones de manera sencilla.
      </p>
      <nav className="home-buttons">
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
          Cerrar Sesión
        </button>
      </nav>
    </main>
  );
};

export default Home;