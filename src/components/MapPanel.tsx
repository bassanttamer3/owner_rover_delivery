import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type RoverForMap = {
  id: string;
  name: string;
  status: string;
  battery?: number;
  lat: number;
  lng: number;
  bearing?: number;
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
};

const createRoverIcon = (status: string, isSelected: boolean, bearing: number = 0) => {
  const colors: Record<string, string> = {
    moving: "#10b981",
    idle: "#eab308",
    error: "#ef4444",
    paused: "#f97316",
    arrived: "#10b981",
  };
  const color = colors[status] ?? "#10b981";
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
        transform: rotate(${bearing}deg);
        transition: all 0.2s ease;
      ">
        <div style="
          width: 0;
          height: 0;
          border-left: ${size/5}px solid transparent;
          border-right: ${size/5}px solid transparent;
          border-bottom: ${size/2.5}px solid ${color};
          margin-bottom: 2px;
        "></div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
  });
};

const MapUpdater = ({ selectedRover }: { selectedRover: RoverForMap | null }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedRover?.lat && selectedRover?.lng) {
      map.panTo([selectedRover.lat, selectedRover.lng], { animate: true, duration: 0.5 });
    }
  }, [selectedRover?.lat, selectedRover?.lng, map]);
  return null;
};

type MapPanelProps = {
  rovers: RoverForMap[];
  selectedRover: RoverForMap | null;
  onMarkerClick: (rover: RoverForMap) => void;
};

const MapPanel = ({ rovers, selectedRover, onMarkerClick }: MapPanelProps) => {
  const [paths, setPaths] = useState<Record<string, [number, number][]>>({});

  useEffect(() => {
    rovers.forEach((rover) => {
      if (rover.status === "moving") {
        setPaths((prev) => ({
          ...prev,
          [rover.id]: [...(prev[rover.id] || []), [rover.lat, rover.lng]],
        }));
      }
    });
  }, [rovers]);

  const zagazigBounds: [[number, number], [number, number]] = [
    [30.5810, 31.4900],
    [30.5990, 31.5150],
  ];

  return (
    <div className="h-full w-full relative">
      <MapContainer bounds={zagazigBounds} className="h-full w-full" scrollWheelZoom={true}>
        <TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapUpdater selectedRover={selectedRover} />

        {rovers.map((rover) => {
          if (rover.lat == null || rover.lng == null) return null;

          const isSelected = selectedRover?.id === rover.id;
          const currentPath = paths[rover.id] || [];
          
          const pathColor = rover.status === "error" ? "#ef4444" : 
                            rover.status === "paused" ? "#f97316" : "#2563eb";

          return (
            <div key={rover.id}>
              <Polyline positions={currentPath} pathOptions={{ color: pathColor, weight: 5 }} />
              
              <Marker
                position={[rover.lat, rover.lng]}
                icon={createRoverIcon(rover.status, isSelected, rover.bearing)}
                eventHandlers={{ click: () => onMarkerClick(rover) }}
              >
                <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                  <div className="p-1">
                    <p className="font-bold text-[#2ec8cf]">{rover.name}</p>
                    <p className="text-[10px] text-gray-400">ID: {rover.id}</p>
                    <div className="mt-2 border-t pt-2 space-y-1">
                      <p className="text-xs"> Battery: <b>{rover.battery}%</b></p>
                      <p className="text-xs"> Status: <span className="capitalize">{rover.status}</span></p>
                    </div>
                  </div>
                </Tooltip>
              </Marker>
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapPanel;