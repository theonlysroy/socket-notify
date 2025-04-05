import axios from "axios";

const baseURL = String(import.meta.env.VITE_API_URL);

const api = axios.create({
  baseURL,
  timeout: 3000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;
