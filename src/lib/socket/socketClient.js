import { io } from "socket.io-client";
import { rideSocketUrl } from "../api/env";

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(rideSocketUrl, {
      autoConnect: false,
      transports: ["websocket", "polling"]
    });
  }

  return socket;
}

export function connectSocket() {
  const instance = getSocket();

  if (!instance.connected) {
    instance.connect();
  }

  return instance;
}

export function disconnectSocket() {
  if (socket?.connected) {
    socket.disconnect();
  }
}
