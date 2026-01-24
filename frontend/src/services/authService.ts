import api from './api';
import { LoginRequest, RegisterRequest, AuthResponse, RefreshTokenRequest } from '../types/auth.types';

export const authService = {
  /**
   * Inscription d'un nouvel utilisateur
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  /**
   * Connexion d'un utilisateur
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Rafraîchir le token d'accès
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/refresh', data);
    return response.data;
  },

  /**
   * Déconnexion
   */
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
    localStorage.clear();
  },

  /**
   * Récupérer le profil utilisateur
   */
  getProfile: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};