import { useEffect, useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icons
delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type RoverLocation = { lat: number; lng: number };
export type RoverForMap = {
  id: string;
  name: string;
  status: string;
  battery?: number;
  location: RoverLocation;
  route?: RoverLocation[]; // المسار المقترح
};

// --- Custom Icons ---
const createRoverIcon = (status: string, isSelected: boolean) => {
  const colors: Record<string, string> = {
    active: "#10b981",
    idle: "#eab308",
    problem: "#ef4444",
  };
  const color = colors[status] ?? colors.active;
  const size = isSelected ? 34 : 28;

  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: white;
        border: 3px solid ${color};
        border-radius: 50%;
        width: ${size}px;
        height: ${size}px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: ${isSelected ? `0 0 15px ${color}` : '0 2px 8px rgba(0,0,0,0.2)'};
        transition: all 0.3s ease;
      ">
        <div style="
          background-color: ${color};
          width: ${size/2.3}px;
          height: ${size/2.3}px;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

const destinationIcon = L.divIcon({
  className: "dest-marker",
  html: `<div style="color: #ef4444;"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
});

// --- Helper Components ---
const MapUpdater = ({ selectedRover }: { selectedRover: RoverForMap | null }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedRover?.location) {
      map.flyTo(
        [selectedRover.location.lat, selectedRover.location.lng],
        18,
        { duration: 1.5 }
      );
    }
  }, [selectedRover, map]);
  return null;
};

type MapPanelProps = {
  rovers: RoverForMap[];
  selectedRover: RoverForMap | null;
  onMarkerClick: (rover: RoverForMap) => void;
};

const MapPanel = ({ rovers, selectedRover, onMarkerClick }: MapPanelProps) => {
  const zagazigPolygon: [number, number][] = [
    [30.5889, 31.5009],
    [30.5889, 31.5043],
    [30.5915, 31.5043],
    [30.5915, 31.5009],
  ];

  const zagazigBounds: [[number, number], [number, number]] = [
    [30.5889, 31.5009],
    [30.5915, 31.5043],
  ];

  // توليد مواقع عشوائية ثابتة لكل رندر عشان الروفر ميفضلش يتنطط
  const roversWithLogic = useMemo(() => {
    return rovers.map((r) => {
      // مكان الروفر الحالي (عشوائي داخل النطاق)
      const currentLat = zagazigBounds[0][0] + Math.random() * (zagazigBounds[1][0] - zagazigBounds[0][0]);
      const currentLng = zagazigBounds[0][1] + Math.random() * (zagazigBounds[1][1] - zagazigBounds[0][1]);
      
      // وجهة عشوائية عشان نرسم خط
      const destLat = zagazigBounds[0][0] + Math.random() * (zagazigBounds[1][0] - zagazigBounds[0][0]);
      const destLng = zagazigBounds[0][1] + Math.random() * (zagazigBounds[1][1] - zagazigBounds[0][1]);

      return {
        ...r,
        location: { lat: currentLat, lng: currentLng },
        destination: { lat: destLat, lng: destLng }
      };
    });
  }, [rovers]);

  return (
    <div className="h-full w-full relative">
      {/* CSS Animation for Dash Effect */}
      <style>{`
        .leaflet-ant-path {
          stroke-dasharray: 10, 10;
          animation: leaflet-ant-path-animation 30s linear infinite;
        }
        @keyframes leaflet-ant-path-animation {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
      `}</style>

      <MapContainer
        bounds={zagazigBounds}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Polygon
          positions={zagazigPolygon}
          pathOptions={{
            color: "#2ec8cf",
            fillColor: "#2ec8cf",
            fillOpacity: 0.05,
            weight: 1,
          }}
        />

        <MapUpdater selectedRover={selectedRover} />

        {roversWithLogic.map((rover) => {
          const isSelected = selectedRover?.id === rover.id;
          
          return (
            <div key={rover.id}>
              {/* Main Rover Marker */}
              <Marker
                position={[rover.location.lat, rover.location.lng]}
                icon={createRoverIcon(rover.status, isSelected)}
                eventHandlers={{ click: () => onMarkerClick(rover) }}
              >
                <Popup>
                  <div className="p-1">
                    <p className="font-bold text-[#2ec8cf]">{rover.name}</p>
                    <p className="text-[10px] text-gray-400">ID: {rover.id}</p>
                    <div className="mt-2 border-t pt-2 space-y-1">
                      <p className="text-xs">🔋 Battery: <b>{rover.battery}%</b></p>
                      <p className="text-xs">📡 Status: <span className="capitalize">{rover.status}</span></p>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Draw Route Line only if Selected and Active */}
              {isSelected && rover.status === "active" && (
                <>
                  {/* The Path Line */}
                  <Polyline
                    positions={[
                      [rover.location.lat, rover.location.lng],
                      [rover.destination.lat, rover.destination.lng]
                    ]}
                    pathOptions={{
                      color: "#10b981",
                      weight: 4,
                      opacity: 0.6,
                      dashArray: "10, 10",
                      className: "leaflet-ant-path" 
                    }}
                  />
                  {/* Destination Marker */}
                  <Marker 
                    position={[rover.destination.lat, rover.destination.lng]} 
                    icon={destinationIcon}
                  >
                    <Popup>Destination Point</Popup>
                  </Marker>
                </>
              )}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapPanel;