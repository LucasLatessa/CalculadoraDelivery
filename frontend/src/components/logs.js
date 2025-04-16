import { useEffect, useState } from "react";
import {obtenerLogs} from "../services/backend";
const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarLogs = async () => {
      try {
        const data = await obtenerLogs();
        setLogs(data);
        console.log(data);
      } catch (error) {
        console.error('Error al cargar logs:', error);
      }
    };
  
    cargarLogs();
  }, []);
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
            <th>Longitud, Latitud</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (

            <tr key={index}>
              <td>{new Date(log.fecha).toLocaleString('es-AR', {
                  timeZone: 'America/Argentina/Buenos_Aires',
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </td>
              <td>{log.direccion_ingresada}</td>
              <td>{log.direccion_geocodificada}</td>
              <td>{log.long_lat}</td>
              <td>{log.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Logs;
