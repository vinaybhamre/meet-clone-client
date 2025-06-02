import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const useSocket = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      socket = io(import.meta.env.VITE_API_URL, {
        transports: ["websocket"],
        reconnection: true,
      });
    }

    socket.on("connect", () => {
      console.log("Connected to signaling server!");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from signaling server.");
      setIsConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error: ", error);
    });

    return () => {
      socket?.off("connect");
      socket?.off("disconnect");
      socket?.off("connect_error");
    };
  }, []);

  return { isConnected, socket };
};
