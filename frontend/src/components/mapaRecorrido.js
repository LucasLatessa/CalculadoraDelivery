import React, { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Polyline, Marker } from "@react-google-maps/api";

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const MapaRecorrido = ({ recorrido, paradas }) => {
  const defaultCenter = { lat: -34.895, lng: -60.016 }; // Chivilcoy
  const [mapCenter, setMapCenter] = useState(defaultCenter);

  useEffect(() => {
    if (recorrido && recorrido.length > 0) {
      setMapCenter(recorrido[0]); // Centrar en el primer punto
    } else {
      setMapCenter(defaultCenter); // Volver a Chivilcoy
    }
  }, [recorrido]); 

  const mapContainerStyle = {
    width: "500px",
    height: "400px",
    margin: "1rem auto",
    display: "block"
  };

  const polylineOptions = {
    strokeColor: "#FF0000",
    strokeOpacity: 0.8,
    strokeWeight: 4
  };

  return (
    <LoadScript googleMapsApiKey={API_KEY}>
      <GoogleMap 
        key={JSON.stringify(recorrido)} // Clave única para forzar actualización
        mapContainerStyle={mapContainerStyle} 
        center={mapCenter} 
        zoom={14}
        options={{
          disableDefaultUI: true,
          zoomControl: true, // Habilita los botones de zoom
          streetViewControl: true, // Oculta Street View
          fullscreenControl: true, // Mantiene el botón de pantalla completa
        }}
      >
        {/* Solo dibuja la línea si `recorrido` es válido */}
        {Array.isArray(recorrido) && recorrido.length > 0 && (
          <Polyline path={recorrido} options={polylineOptions} />
        )}

        {/* Solo muestra marcadores si `paradas` es válido */}
        {Array.isArray(paradas) && paradas.length > 0 && paradas.map((parada, index) => (
          <Marker key={index} position={parada} label={`${index + 1}`} />
        ))}

      </GoogleMap>
    </LoadScript>
  );
};

export default MapaRecorrido;
