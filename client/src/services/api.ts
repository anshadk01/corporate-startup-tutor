import axios from "axios";

// Resolve base URL safely
const getBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== "") {
    let clean = envUrl.trim().replace(/\/+$/, "");
    if (!clean.endsWith("/api")) {
      clean = `${clean}/api`;
    }
    return clean;
  }
  return import.meta.env.PROD
    ? "https://corporate-startup-tutor-oids.onrender.com/api"
    : "/api";
};

const api = axios.create({
  baseURL: getBaseUrl(),
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