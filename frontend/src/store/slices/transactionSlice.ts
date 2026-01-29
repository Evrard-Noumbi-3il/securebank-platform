import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import transactionService from '../../services/transactionService';
import { Transaction, TransferRequest, TransactionState } from '../../types/transaction.types';
import { RootState } from '../index';

const initialState: TransactionState = {
  transactions: [],
  loading: false,
  error: null,
};


export const fetchTransactions = createAsyncThunk(
  'transactions/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      return await transactionService.getAllUserTransactions();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch transactions');
    }
  }
);


export const fetchAccountTransactions = createAsyncThunk(
  'transactions/fetchByAccount',
  async (accountId: string, { rejectWithValue }) => {
    try {
      return await transactionService.getAccountTransactions(accountId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch account transactions');
    }
  }
);


export const makeTransfer = createAsyncThunk(
  'transactions/transfer',
  async (transferRequest: TransferRequest, { rejectWithValue }) => {
    try {
      return await transactionService.transfer(transferRequest);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Transfer failed');
    }
  }
);

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    clearTransactions: (state) => {
      state.transactions = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(fetchAccountTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountTransactions.fulfilled, (state, action: PayloadAction<Transaction[]>) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchAccountTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      .addCase(makeTransfer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(makeTransfer.fulfilled, (state, action: PayloadAction<Transaction>) => {
        state.loading = false;
       
        state.transactions.unshift(action.payload);
      })
      .addCase(makeTransfer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearTransactions } = transactionSlice.actions;

export const selectTransactions = (state: RootState) => state.transactions.transactions;
export const selectTransactionsLoading = (state: RootState) => state.transactions.loading;
export const selectTransactionsError = (state: RootState) => state.transactions.error;

export const selectRecentTransactions = (state: RootState) =>
  state.transactions.transactions.slice(0, 5);

export default transactionSlice.reducer;