import api from './api';
import { Transaction, TransferRequest } from '../types/transaction.types';

export const transactionService = {

    /**

   * Récupérer toutes les transactions de l'utilisateur

   */

  getTransactions: async (): Promise<Transaction[]> => {

    const response = await api.get<Transaction[]>('/transactions');

    return response.data;

  },
  
  /**
   * Récupérer les transactions d'un compte spécifique
   */
  getAccountTransactions: async (accountId: string): Promise<Transaction[]> => {
    const response = await api.get<Transaction[]>(`/transactions/account/${accountId}`);
    return response.data;
  },

  /**
   * Effectuer un virement
   */
  transfer: async (data: TransferRequest): Promise<Transaction> => {
    const response = await api.post<Transaction>('/transactions/transfer', data);
    return response.data;
  },

  /**
   * Récupérer une transaction par son ID
   */
  getTransactionById: async (transactionId: string): Promise<Transaction> => {
    const response = await api.get<Transaction>(`/transactions/${transactionId}`);
    return response.data;
  },
};