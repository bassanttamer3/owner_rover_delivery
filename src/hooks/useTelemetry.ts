import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { RoverData } from "../common/interfaces/useTelemetry/useTelemetry.interfaces";



export const useTelemetry = (companyId?: string) => {
  const [rovers, setRovers] = useState<RoverData[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    const socketInstance = io((import.meta.env.VITE_TELEMETRY_URL as string) || "http://localhost:8080", {
      auth: { userId: "viewer-R01" },
      path: "/telemetry-socket/",
      transports: ["websocket", "polling"],
    });
   socketInstance.onAny((event, ...args) => {
  console.log("EVENT:", event, args);
   });
 
    setSocket(socketInstance);
    
    socketInstance.on("connect", () => {
      if (companyId) {
        socketInstance.emit("join:fleet:company", { companyId });
      } else {
        socketInstance.emit("join:fleet:all");
      }
    });

    socketInstance.on("fleet:snapshot", (data: RoverData[]) => {
      setRovers(data);
    });

    socketInstance.on("rover:update", (updatedRover: RoverData) => {
      setRovers((prev) => {
        const exists = prev.find(r => r.roverId === updatedRover.roverId);
        if (exists) {
          return prev.map(r =>
            r.roverId === updatedRover.roverId ? { ...r, ...updatedRover } : r
          );
        }
        return [...prev, updatedRover];
      });
    });

    return () => {
      if (companyId) {
        socketInstance.emit("leave:room", { room: `fleet:company:${companyId}` });
      } else {
        socketInstance.emit("leave:room", { room: "fleet:all" });
      }
      socketInstance.disconnect();
    };
  }, [companyId]);

  const sendCommand = (roverId: string, cmd: "pause" | "resume" | "stop" | "speed", value?: number) => {
    if (socket) {
      socket.emit("rover:command", { roverId, cmd, value });
    }
  };

  return { rovers, sendCommand };
};
