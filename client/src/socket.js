import { io } from "socket.io-client";

const socket = io(
  `https://${window.location.hostname}:5000`,
  {
    transports: ["polling"],
    secure: true,
    withCredentials: true,
  }
);

export default socket;