/* eslint-disable no-useless-catch */
const API_URL = "http://localhost:8000/api";

class AuthService {
  // Enregistrement d'un nouvel utilisateur
  async register(userData) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      // Sauvegarder le token et les données utilisateur
      if (data.token) {
        this.setToken(data.token);
        this.setUser(data.user);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Connexion d'un utilisateur
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la connexion");
      }

      // Sauvegarder le token et les données utilisateur
      if (data.token) {
        this.setToken(data.token);
        this.setUser(data.user);
      }

      return data;
    } catch (error) {
      throw error;
    }
  }

  // Déconnexion
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }

  // Sauvegarder le token
  setToken(token) {
    localStorage.setItem("token", token);
  }

  // Récupérer le token
  getToken() {
    return localStorage.getItem("token");
  }

  // Sauvegarder les données utilisateur
  setUser(user) {
    localStorage.setItem("user", JSON.stringify(user));
  }

  // Récupérer les données utilisateur
  getUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }

  // Vérifier si l'utilisateur est connecté
  isAuthenticated() {
    return !!this.getToken();
  }

  // Récupérer les informations utilisateur actuelles depuis l'API
  async getCurrentUser() {
    const token = this.getToken();
    if (!token) {
      throw new Error("Non authentifié");
    }

    try {
      const response = await fetch(`${API_URL}/me`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error("Session expirée");
        }
        throw new Error("Erreur lors de la récupération des données");
      }

      const data = await response.json();
      this.setUser(data);
      return data;
    } catch (error) {
      throw error;
    }
  }

  // Faire une requête API authentifiée
  async authenticatedRequest(url, options = {}) {
    const token = this.getToken();

    if (!token) {
      throw new Error("Non authentifié");
    }

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        this.logout();
        throw new Error("Session expirée");
      }

      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();
