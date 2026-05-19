// Configuration de l'API
const getApiBaseUrl = () => {
  // En production, utiliser l'URL relative
  if (import.meta.env.PROD) {
    return "/api";
  }

  // En développement : URL relative → proxy Vite (vite.config.js) vers localhost:8000
  return import.meta.env.VITE_API_BASE_URL || "/api";
};

export const API_BASE_URL = getApiBaseUrl();

// Fonction utilitaire pour construire les URLs d'API
export const buildApiUrl = (endpoint) => {
  // Enlever le slash initial si présent
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  return `${API_BASE_URL}/${cleanEndpoint}`;
};

export default {
  API_BASE_URL,
  buildApiUrl,
  APP_TITLE: import.meta.env.VITE_APP_TITLE || "Taxi Biker Paris",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  NODE_ENV: import.meta.env.NODE_ENV || "development",
};
