import { io } from "socket.io-client";

const socket = io(
  "https://chat-app-gtzp.onrender.com",
  {
    transports: ["polling"],

    upgrade: false,

    reconnection: true,
  }
);

export default socket;