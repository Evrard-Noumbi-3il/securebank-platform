import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { transactionService } from '../../services/transactionService';
import { Transaction, TransactionState, TransferRequest } from '../../types/transaction.types';

// État initial
const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
};

// Thunks asynchrones

/**
 * Récupérer toutes les transactions
 */
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactions();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la récupération des transactions');
    }
  }
);

/**
 * Récupérer les transactions d'un compte spécifique
 */
export const fetchAccountTransactions = createAsyncThunk(
  'transactions/fetchAccountTransactions',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const response = await transactionService.getAccountTransactions(accountId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la récupération des transactions');
    }
  }
);

/**
 * Effectuer un virement
 */
export const makeTransfer = createAsyncThunk(
  'transactions/makeTransfer',
  async (data: TransferRequest, { rejectWithValue }) => {
    try {
      const response = await transactionService.transfer(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors du virement');
    }
  }
);

/**
 * Récupérer une transaction par ID
 */
export const fetchTransactionById = createAsyncThunk(
  'transactions/fetchTransactionById',
  async (transactionId: string, { rejectWithValue }) => {
    try {
      const response = await transactionService.getTransactionById(transactionId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la récupération de la transaction');
    }
  }
);

// Slice
const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    // Action pour réinitialiser l'erreur
    clearError: (state) => {
      state.error = null;
    },
    // Action pour réinitialiser les transactions
    clearTransactions: (state) => {
      state.transactions = [];
    },
  },
  extraReducers: (builder) => {
    // Fetch Transactions
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Account Transactions
    builder
      .addCase(fetchAccountTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
        state.error = null;
      })
      .addCase(fetchAccountTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Make Transfer
    builder
      .addCase(makeTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(makeTransfer.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.loading = false;
        state.transactions.unshift(action.payload); // Ajouter au début de la liste
        state.error = null;
      })
      .addCase(makeTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Transaction By ID
    builder
      .addCase(fetchTransactionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionById.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.loading = false;
        // Mettre à jour la transaction si elle existe déjà, sinon l'ajouter
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
        } else {
          state.transactions.push(action.payload);
        }
        state.error = null;
      })
      .addCase(fetchTransactionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { clearError, clearTransactions } = transactionSlice.actions;

// Selectors
export const selectTransactions = (state: { transactions: TransactionState }) => state.transactions.transactions;
export const selectTransactionsLoading = (state: { transactions: TransactionState }) => state.transactions.loading;
export const selectTransactionsError = (state: { transactions: TransactionState }) => state.transactions.error;

// Selector pour les transactions récentes (5 dernières)
export const selectRecentTransactions = (state: { transactions: TransactionState }) => {
  return state.transactions.transactions.slice(0, 5);
};

// Selector pour filtrer les transactions par statut
export const selectTransactionsByStatus = (status: string) => (state: { transactions: TransactionState }) => {
  return state.transactions.transactions.filter(t => t.status === status);
};

export default transactionSlice.reducer;