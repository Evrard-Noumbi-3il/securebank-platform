import axios, { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

// Configuration de base
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8080/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs et le refresh token
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Si erreur 401 et pas encore de retry
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // Récupérer le refresh token
        const refreshToken = localStorage.getItem('refreshToken');
        
        if (!refreshToken) {
          // Pas de refresh token, rediriger vers login
          localStorage.clear();
          window.location.href = '/login';
          return Promise.reject(error);
        }
        
        // Appeler l'endpoint de refresh
        const response = await axios.post(
          `${process.env.REACT_APP_API_URL || 'http://localhost:8080/api'}/auth/refresh`,
          { refreshToken }
        );
        
        const { accessToken } = response.data;
        
        // Sauvegarder le nouveau token
        localStorage.setItem('accessToken', accessToken);
        
        // Réessayer la requête originale avec le nouveau token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh a échoué, rediriger vers login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;