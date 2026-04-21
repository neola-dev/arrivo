import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap ,useMapEvents} from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";

// Fix default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function Routing({ userLat, userLng, destLat, destLng }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !userLat || !userLng || !destLat || !destLng) return;

    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(userLat, userLng),
        L.latLng(destLat, destLng),
      ],
      lineOptions: {
        styles: [{ color: "blue", weight: 5 }],
      },
      createMarker: () => null,
      addWaypoints: false,
      routeWhileDragging: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [map, userLat, userLng, destLat, destLng]);

  return null;
}

function MapSelector({
  userLat,
  userLng,
  destLat,
  destLng,
  setDestLat,
  setDestLng,
  setPlaceName,
  setTestMode,
  journeyStarted,
}) {
  function LocationSelector() {
    useMapEvents({
      click(e) {
        if (journeyStarted) return;

        setDestLat(e.latlng.lat);
        setDestLng(e.latlng.lng);
        setPlaceName("Selected from Map");
        setTestMode(false);
      },
    });

    return null;
  }

  return (
    <MapContainer
      center={[userLat || 11, userLng || 77]}
      zoom={13}
      style={{ height: "400px", width: "100%", marginTop: "20px" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* User marker */}
      {userLat && userLng && <Marker position={[userLat, userLng]} />}

      {/* Destination marker */}
      {destLat && destLng && <Marker position={[destLat, destLng]} />}

      {/* ROUTE LINE */}
      <Routing
        userLat={userLat}
        userLng={userLng}
        destLat={destLat}
        destLng={destLng}
      />

      <LocationSelector />
    </MapContainer>
  );
}

export default MapSelector;