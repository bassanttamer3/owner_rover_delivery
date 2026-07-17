export interface RoverData {
  currentOrder: Order;
  roverId: string;
  lat: number;
  lng: number;
  name?: string;
  color?: string;
  bearing?: number;
  battery?: number;
  speed?: number;
  status?: "moving" | "idle" | "arrived" | "error" | "paused";
  progress?: number;
  eta?: number;
  startLat?: number;
  startLng?: number;
  endLat?: number;
  endLng?: number;
}