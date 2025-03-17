import React from "react";
import { MapContainer, TileLayer, Polyline, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet"; // Importar Leaflet para los iconos

// Configurar ícono de marcador
const iconoMarcador = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const MapaRecorrido = ({ recorrido, paradas }) => {
  const posicionInicial = [-34.9003684, -60.0210392]; // Chivilcoy

  return (
    <>
      <h2>Mapa de Recorrido</h2>
      <MapContainer center={posicionInicial} zoom={15} style={{ width: "100%", height: "400px" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="© OpenStreetMap contributors" />

        {/* Dibuja la línea del recorrido */}
        {Array.isArray(recorrido) && recorrido.length > 0 && (
          <>
            <Polyline positions={recorrido} color="blue" />
            {/* Marcadores solo en las paradas*/}
            {paradas.map((punto, index) => (
              <Marker key={index} position={[punto[1], punto[0]]} icon={iconoMarcador} />
            ))}
          </>
        )}
      </MapContainer>
    </>
  );
};


export default MapaRecorrido;
