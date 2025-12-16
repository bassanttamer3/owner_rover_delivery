import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (status) => {
  const colors = { active: '#10b981', idle: '#eab308', problem: '#ef4444' };
  const color = colors[status] || colors.active;
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: white;
        border: 3px solid ${color};
        border-radius: 50%;
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      ">
        <div style="
          background-color: ${color};
          width: 12px;
          height: 12px;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
};

// Map updater
const MapUpdater = ({ selectedRover }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedRover) {
      map.flyTo([selectedRover.location.lat, selectedRover.location.lng], 18, { duration: 1.5 });
    }
  }, [selectedRover, map]);
  return null;
};

// توليد إحداثيات عشوائية داخل حدود الجامعة
const randomPositionWithinBounds = (bounds) => {
  const [southWest, northEast] = bounds;
  const lat = southWest[0] + Math.random() * (northEast[0] - southWest[0]);
  const lng = southWest[1] + Math.random() * (northEast[1] - southWest[1]);
  return { lat, lng };
};

const MapPanel = ({ rovers, selectedRover, onMarkerClick }) => {
  // حدود تقريبية لحرم جامعة الزقازيق على شكل Polygon
  const zagazigPolygon = [
    [30.5889, 31.5009],
    [30.5889, 31.5043],
    [30.5915, 31.5043],
    [30.5915, 31.5009],
  ];

  // إنشاء "bounds" من الPolygon لتوليد مواقع عشوائية
  const zagazigBounds = [
    [30.5889, 31.5009], // جنوب-غرب
    [30.5915, 31.5043], // شمال-شرق
  ];

  // تعيين مواقع عشوائية لكل روفر داخل حدود الحرم
  const roversWithRandomPos = rovers.map((r) => ({
    ...r,
    location: randomPositionWithinBounds(zagazigBounds),
  }));

  return (
    <div className="h-full w-full rounded-lg overflow-hidden shadow-md">
      <MapContainer
        bounds={zagazigBounds}
        className="h-full w-full"
        scrollWheelZoom={true}
        maxBounds={zagazigBounds}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polygon
          positions={zagazigPolygon}
          pathOptions={{ color: '#2563eb', fillColor: '#3b82f6', fillOpacity: 0.1, weight: 2 }}
        />

        <MapUpdater selectedRover={selectedRover} />

        {roversWithRandomPos.map((rover) => (
          <React.Fragment key={rover.id}>
            <Marker
              position={[rover.location.lat, rover.location.lng]}
              icon={createCustomIcon(rover.status)}
              eventHandlers={{ click: () => onMarkerClick(rover) }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{rover.name}</p>
                  <p className="text-xs text-gray-600">{rover.id}</p>
                  <p className="text-xs mt-1">Battery: {rover.battery}%</p>
                  <p className="text-xs">Status: {rover.status}</p>
                </div>
              </Popup>
            </Marker>

            {selectedRover?.id === rover.id && rover.route.length > 0 && (
              <Polyline
                positions={rover.route.map((point) => [point.lat, point.lng])}
                color="#10b981"
                weight={3}
                opacity={0.7}
              />
            )}
          </React.Fragment>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPanel;
