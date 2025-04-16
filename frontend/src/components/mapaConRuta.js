import { GoogleMap, LoadScript, DirectionsRenderer } from "@react-google-maps/api"
const ORIGEN_COORDENADAS = { lat: -34.9003698, lng: -60.0210871 } // Gral. Pinto 58, Chivilcoy

const MapaConRuta = ({ directions }) => {
    if (!directions) return null
  
    // Eliminamos el ultimo tramo (vuelta al origen)
    const routeSinVuelta = {
      ...directions,
      routes: [
        {
          ...directions.routes[0],
          legs: directions.routes[0].legs.slice(0, -1), // quitamos la ultima "pierna"
        },
      ],
    }
  
    return (
      <GoogleMap
        center={ORIGEN_COORDENADAS}
        zoom={13}
        mapContainerStyle={{ width: "100%", height: "500px" }}
        options={{
            disableDefaultUI: true,
            zoomControl: true, // Habilita los botones de zoom
            streetViewControl: true, // Oculta Street View
            fullscreenControl: true, // Mantiene el botón de pantalla completa
          }}
      >
        <DirectionsRenderer
          directions={routeSinVuelta}
        />
      </GoogleMap>
    )
  }
  
export default MapaConRuta