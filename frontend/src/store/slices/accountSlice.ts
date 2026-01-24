import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { accountService } from '../../services/accountService';
import { Account, AccountState, CreateAccountRequest } from '../../types/account.types';

// État initial
const initialState: AccountState = {
  accounts: [],
  selectedAccount: null,
  loading: false,
  error: null,
};

// Thunks asynchrones

/**
 * Récupérer tous les comptes
 */
export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await accountService.getAccounts();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la récupération des comptes');
    }
  }
);

/**
 * Récupérer un compte par ID
 */
export const fetchAccountById = createAsyncThunk(
  'accounts/fetchAccountById',
  async (accountId: string, { rejectWithValue }) => {
    try {
      const response = await accountService.getAccountById(accountId);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la récupération du compte');
    }
  }
);

/**
 * Créer un nouveau compte
 */
export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (data: CreateAccountRequest, { rejectWithValue }) => {
    try {
      const response = await accountService.createAccount(data);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la création du compte');
    }
  }
);


/**
 * Supprimer un compte
 */
export const deleteAccount = createAsyncThunk(
  'accounts/deleteAccount',
  async (accountId: string, { rejectWithValue }) => {
    try {
      await accountService.deleteAccount(accountId);
      return accountId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Erreur lors de la suppression du compte');
    }
  }
);

// Slice
const accountSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    // Action pour sélectionner un compte
    selectAccount: (state, action: PayloadAction<Account | null>) => {
      state.selectedAccount = action.payload;
    },
    // Action pour réinitialiser l'erreur
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch Accounts
    builder
      .addCase(fetchAccounts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action: PayloadAction<Account[]>) => {
        state.loading = false;
        state.accounts = action.payload;
        state.error = null;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch Account By ID
    builder
      .addCase(fetchAccountById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAccountById.fulfilled, (state, action: PayloadAction<Account>) => {
        state.loading = false;
        state.selectedAccount = action.payload;
        state.error = null;
      })
      .addCase(fetchAccountById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create Account
    builder
      .addCase(createAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        state.loading = false;
        state.accounts.push(action.payload);
        state.error = null;
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete Account
    builder
      .addCase(deleteAccount.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAccount.fulfilled, (state, action: PayloadAction<string>) => {
        state.loading = false;
        state.accounts = state.accounts.filter((account: Account) => account.id !== action.payload);
        if (state.selectedAccount?.id === action.payload) {
          state.selectedAccount = null;
        }
        state.error = null;
      })
      .addCase(deleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

// Actions
export const { selectAccount, clearError } = accountSlice.actions;

// Selectors
export const selectAccounts = (state: { accounts: AccountState }) => state.accounts.accounts;
export const selectSelectedAccount = (state: { accounts: AccountState }) => state.accounts.selectedAccount;
export const selectAccountsLoading = (state: { accounts: AccountState }) => state.accounts.loading;
export const selectAccountsError = (state: { accounts: AccountState }) => state.accounts.error;

// Selector pour calculer le total balance
export const selectTotalBalance = (state: { accounts: AccountState }) => {
  return state.accounts.accounts.reduce((total: number, account: Account) => total + account.balance, 0);
};

export default accountSlice.reducer;