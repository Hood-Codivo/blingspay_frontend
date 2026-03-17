import axios from "axios";

const baseURL = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL_PROD
  : "http://localhost:8000/api";

const api = axios.create({
  baseURL,
});

api.interceptors.request.use((config) => {
  // ✅ Get wallet from window (set when wallet connects)
  const wallet = window.__walletAddress;
  if (wallet) {
    config.headers["x-wallet-address"] = wallet;
  }
  return config;
});

export default api;
