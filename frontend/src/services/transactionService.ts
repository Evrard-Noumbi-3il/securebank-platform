import api from './api';
import { TransferRequest, Transaction } from '../types/transaction.types';

const transactionService = {
  getAllUserTransactions: async (): Promise<Transaction[]> => {
    const response = await api.get('/transactions');
    return response.data;
  },


  getAccountTransactions: async (accountId: string): Promise<Transaction[]> => {
    const response = await api.get(`/transactions/account/${accountId}`);
    return response.data;
  },


  getAccountTransactionsPaginated: async (
    accountId: string,
    page: number = 0,
    size: number = 20
  ): Promise<{ content: Transaction[]; totalPages: number; totalElements: number }> => {
    const response = await api.get(`/transactions/account/${accountId}/paginated`, {
      params: { page, size },
    });
    return response.data;
  },


  transfer: async (transferRequest: TransferRequest): Promise<Transaction> => {
    const response = await api.post('/transactions/transfer', transferRequest);
    return response.data;
  },
};

export default transactionService;