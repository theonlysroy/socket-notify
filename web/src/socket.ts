import { io } from "socket.io-client";

const nodeEnv = String(import.meta.env.VITE_NODE_ENV);
const apiUrl = String(import.meta.env.VITE_API_URL);

const URL = nodeEnv === "production" ? undefined : apiUrl;

export const socketClient = io(URL, {
  autoConnect: false,
});
