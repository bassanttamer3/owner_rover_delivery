import React, { useEffect, useState, useMemo } from "react";
import { GoogleMap, Marker, Polyline, useJsApiLoader } from "@react-google-maps/api";

const containerStyle = { width: "100%", height: "100%" };

const createMarkerIcon = (status) => {
  const colors = { active: "green", idle: "orange", problem: "red" };
  return {
    path: window.google.maps.SymbolPath.CIRCLE,
    fillColor: colors[status] || "green",
    fillOpacity: 1,
    strokeWeight: 2,
    strokeColor: "white",
    scale: 10,
  };
};

const MapPanelGoogle = ({ rovers, selectedRover, onMarkerClick }) => {
  const { isLoaded } = useJsApiLoader({ googleMapsApiKey: "YOUR_API_KEY" });
  const [moveIndex, setMoveIndex] = useState(0);

  useEffect(() => setMoveIndex(0), [selectedRover?.id]);

  useEffect(() => {
    if (!selectedRover?.route?.length) return;
    const interval = setInterval(() => {
      setMoveIndex((prev) =>
        prev < selectedRover.route.length - 1 ? prev + 1 : prev
      );
    }, 1500);
    return () => clearInterval(interval);
  }, [selectedRover]);

  const movingPosition = useMemo(() => {
    if (!selectedRover) return null;
    if (selectedRover.route?.length) {
      const point = selectedRover.route[moveIndex];
      return { lat: point.lat, lng: point.lng };
    }
    return { lat: selectedRover.location.lat, lng: selectedRover.location.lng };
  }, [selectedRover, moveIndex]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={movingPosition || { lat: 26.8206, lng: 30.8025 }}
      zoom={6}
      options={{ streetViewControl: false, mapTypeControl: false }}
    >
      {/* Route Line */}
      {selectedRover?.route?.length > 0 && (
        <Polyline
          path={selectedRover.route.map((p) => ({ lat: p.lat, lng: p.lng }))}
          options={{ strokeColor: "#10b981", strokeWeight: 4 }}
        />
      )}

      {/* Rovers */}
      {rovers.map((rover) => {
        const position =
          selectedRover?.id === rover.id && movingPosition
            ? movingPosition
            : { lat: rover.location.lat, lng: rover.location.lng };
        return (
          <Marker
            key={rover.id}
            position={position}
            icon={createMarkerIcon(rover.status)}
            onClick={() => onMarkerClick(rover)}
          />
        );
      })}
    </GoogleMap>
  );
};

export default MapPanelGoogle;
