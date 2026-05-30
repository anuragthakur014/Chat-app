import { io } from "socket.io-client";

const socket = io(
  "https://chat-app-gtzp.onrender.com",
  {
    transports: ["websocket", "polling"],
  }
);

export default socket;  