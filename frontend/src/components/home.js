import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, verificarSesion } from "../services/supabaseClient";
import styles from "../styles/home.module.css";

const Home = () => {
  const navigate = useNavigate();
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      setLoading(true);
      try {
        const logueado = await verificarSesion();
        setIsLogged(logueado);
      } catch {
        setIsLogged(false);
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleNavigate = (path) => navigate(path);

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  if (loading) {
    return (
      <main className={styles.main}>
        <h1 className={styles.title}>Delivery Smart</h1>
        <p className={styles.description}>Cargando...</p>
      </main>
    );
  }

  if (!isLogged) {
    return (
      <main className={styles.main}>
        <h1 className={styles.title}>Bienvenido a Delivery Smart</h1>
        <p className={styles.description}>
          Por favor, inicia sesión para acceder a las funcionalidades.
        </p>
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={() => handleNavigate('/login')}
          style={{ minWidth: 180, marginTop: "2rem" }}
        >
          Iniciar Sesión
        </button>
        <footer className={styles.footer}>
          Delivery Smart &copy; {new Date().getFullYear()}
        </footer>
      </main>
    );
  }

  return (
    <main className={styles.main}>
      <h1 className={styles.title}>Bienvenido a Delivery Smart</h1>
      <p className={styles.description}>
        Gestiona tus precios y direcciones de manera sencilla.
      </p>
      <nav className={styles.buttons}>
        <button
          className={`${styles.button} ${styles.buttonPrimary}`}
          onClick={() => handleNavigate('/calculator')}
        >
          Calculadora
        </button>
        <button
          className={`${styles.button} ${styles.buttonSecondary}`}
          onClick={() => handleNavigate('/logs')}
        >
          Ver Logs
        </button>
        <button
          className={`${styles.button} ${styles.buttonTertiary}`}
          onClick={handleLogout}
        >
          Cerrar Sesión
        </button>
      </nav>
      <footer className={styles.footer}>
        Delivery Smart &copy;{new Date().getFullYear()}
      </footer>
    </main>
  );
};

export default Home;