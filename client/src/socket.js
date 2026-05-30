import { io } from "socket.io-client";

const socket = io(
  "https://chat-app-gtzp.onrender.com",
  {
    transports: ["polling"],

    reconnection: true,

    reconnectionAttempts: 10,

    reconnectionDelay: 1000,
  }
);

export default socket;