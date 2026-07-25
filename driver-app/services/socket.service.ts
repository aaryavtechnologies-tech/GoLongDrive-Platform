import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../store/useAuthStore";

const SOCKET_URL = "http://localhost:5000";

class SocketService {
  private socket: Socket | null = null;

  connect() {
    const token = useAuthStore.getState().token;
    if (!token) return;

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        auth: {
          token,
        },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      this.socket.on("connect", () => {
        console.log("Socket connected:", this.socket?.id);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });
      
      this.socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Ride events will be added later
}

export const socketService = new SocketService();
