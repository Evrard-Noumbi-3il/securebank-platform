import api from './api';
import { Account, CreateAccountRequest} from '../types/account.types';

export const accountService = {
  /**
   * Récupérer tous les comptes de l'utilisateur
   */
  getAccounts: async (): Promise<Account[]> => {
    const response = await api.get<Account[]>('/accounts');
    return response.data;
  },

  /**
   * Récupérer un compte par son ID
   */
  getAccountById: async (accountId: string): Promise<Account> => {
    const response = await api.get<Account>(`/accounts/${accountId}`);
    return response.data;
  },

  /**
   * Créer un nouveau compte
   */
  createAccount: async (data: CreateAccountRequest): Promise<Account> => {
    const response = await api.post<Account>('/accounts', data);
    return response.data;
  },

  /**
   * Supprimer un compte
   */
  deleteAccount: async (accountId: string): Promise<void> => {
    await api.delete(`/accounts/${accountId}`);
  },
};