import axios from "axios";

// Automatically target live Render backend in production or when VITE_API_URL is set
const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? "https://corporate-startup-tutor-oids.onrender.com/api"
    : "/api");

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cst_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token only if not on login
      if (!window.location.pathname.includes("/login")) {
        localStorage.removeItem("cst_token");
        localStorage.removeItem("cst_user");
      }
    }
    return Promise.reject(error);
  }
);

export default api;