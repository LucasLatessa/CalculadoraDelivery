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
            <th>Longitud, Latitud</th> {/* Columna combinada */}
          </tr>
        </thead>
        <tbody>
          {logs.map((log, index) => (
            <tr key={index}>
              <td>{log.fecha}</td>
              <td>{log.direccion_ingresada}</td>
              <td>{log.direccion_geocodificada}</td>
              <td>{`${log.long_lat}`}</td> {/* Combinando longitud y latitud */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Logs;
