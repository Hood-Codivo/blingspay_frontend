import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
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
