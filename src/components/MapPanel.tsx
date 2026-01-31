import { useEffect } from "react";
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

delete (L.Icon.Default.prototype as unknown as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export type RoverLocation = { lat: number; lng: number };
export type RoverRoutePoint = { lat: number; lng: number };
export type RoverForMap = {
  id: string;
  name: string;
  status: string;
  battery?: number;
  location: RoverLocation;
  route: RoverRoutePoint[];
};

const createCustomIcon = (status: string) => {
  const colors: Record<string, string> = {
    active: "#10b981",
    idle: "#eab308",
    problem: "#ef4444",
  };
  const color = colors[status] ?? colors.active;
  return L.divIcon({
    className: "custom-marker",
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

const randomPositionWithinBounds = (
  bounds: [[number, number], [number, number]]
): RoverLocation => {
  const [southWest, northEast] = bounds;
  const lat = southWest[0] + Math.random() * (northEast[0] - southWest[0]);
  const lng = southWest[1] + Math.random() * (northEast[1] - southWest[1]);
  return { lat, lng };
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
          pathOptions={{
            color: "#2563eb",
            fillColor: "#3b82f6",
            fillOpacity: 0.1,
            weight: 2,
          }}
        />

        <MapUpdater selectedRover={selectedRover} />

        {roversWithRandomPos.map((rover) => (
          <div key={rover.id}>
            <Marker
              position={[rover.location.lat, rover.location.lng]}
              icon={createCustomIcon(rover.status)}
              eventHandlers={{ click: () => onMarkerClick(rover) }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{rover.name}</p>
                  <p className="text-xs text-gray-600">{rover.id}</p>
                  <p className="text-xs mt-1">Battery: {rover.battery ?? "—"}%</p>
                  <p className="text-xs">Status: {rover.status}</p>
                </div>
              </Popup>
            </Marker>

            {selectedRover?.id === rover.id && rover.route?.length > 0 && (
              <Polyline
                positions={rover.route.map((point) => [point.lat, point.lng])}
                pathOptions={{ color: "#10b981", weight: 3, opacity: 0.7 }}
              />
            )}
          </div>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapPanel;
