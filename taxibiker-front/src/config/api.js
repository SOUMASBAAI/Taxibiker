// Configuration de l'API
const getApiBaseUrl = () => {
  // En production, utiliser l'URL relative
  if (import.meta.env.PROD) {
    return "/api";
  }

  // En développement, utiliser localhost
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";
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
  APP_TITLE: import.meta.env.VITE_APP_TITLE || "TaxiBiker",
  APP_VERSION: import.meta.env.VITE_APP_VERSION || "1.0.0",
  NODE_ENV: import.meta.env.NODE_ENV || "development",
};
