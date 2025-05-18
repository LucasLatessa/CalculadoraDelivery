import { useEffect, useState } from "react";
import { fetchLogs } from "../services/supabaseService";
import "./logs.css";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const cargarLogs = async () => {
      try {
        const data = await fetchLogs();
        setLogs(data);
        console.log(data);
      } catch (error) {
        setError("Error al cargar logs");
        console.error("Error al cargar logs:", error);
      }
    };

    cargarLogs();
  }, []);

  const formatearFecha = (fechaUTC) => {
    return new Date(fechaUTC + "Z").toLocaleString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="logs-container">
      <h2 className="logs-title">📜 Logs de Consultas</h2>
      {error && <p className="logs-error">{error}</p>}
      <div className="logs-table-container">
        <table className="logs-table">
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Direccion Ingresada</th>
              <th>Direccion Geocodificada</th>
              <th>Longitud, Latitud</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log, index) => (
              <tr key={index}>
                <td>{formatearFecha(log.fecha)}</td>
                <td>{log.direccion_ingresada}</td>
                <td>{log.direccion_geocodificada}</td>
                <td>{log.long_lat}</td>
                <td>{log.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Logs;