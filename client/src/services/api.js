import axios from "axios";

const base = import.meta.env.VITE_API_URL || "http://localhost:5000";
// Ensure no trailing slash and add /api
const API_URL = base.replace(/\/$/, "") + (base.endsWith("/api") ? "" : "/api");
console.log("Final API URL being used:", API_URL);

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const authStorage = localStorage.getItem("auth-storage");
  if (authStorage) {
    const { state } = JSON.parse(authStorage);
    if (state.token) {
      config.headers.Authorization = `Bearer ${state.token}`;
    }
  }
  return config;
});

export default api;
