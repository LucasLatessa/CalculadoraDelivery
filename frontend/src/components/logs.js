import { useEffect, useState } from "react";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/log`);
        if (!response.ok) {
          throw new Error("Error al obtener los logs");
        }
        const data = await response.json();

        // Ordenar los logs por fecha (más reciente primero)
        const sortedLogs = data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
        setLogs(sortedLogs);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchLogs();
  }, []);

  const formatTime = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleString([], {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <h2>📜 Logs de Consultas</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Fecha</th> 
            <th>Dirección Ingresada</th>
            <th>Dirección Geocodificada</th>
            <th>Tipo</th>
            <th>Longitud, Latitud</th> {/* Columna combinada */}
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td>{formatTime(log.fecha)}</td> {/* Formatear la fecha */}
              <td>{log.direccion_ingresada}</td>
              <td>{log.direccion_geocodificada}</td>
              <td>{log.tipo}</td>
              <td>{`${log.long_lat}`}</td> {/* Combinando longitud y latitud */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Logs;
