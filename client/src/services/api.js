import axios from "axios";

const API = axios.create({
  baseURL:
    "https://chat-app-gtzp.onrender.com/api",
});

export default API;