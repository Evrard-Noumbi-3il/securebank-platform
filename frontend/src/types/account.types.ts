export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: string;
  balance: number;
  currency: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
  createdAt: string;
}

export interface AccountState {
  accounts: Account[];
  selectedAccount: Account | null;
  loading: boolean;
  error: string | null;
}

export interface CreateAccountRequest {
  accountType: string;
  currency: string;
}

export interface UpdateAccountRequest {
  accountType: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CLOSED';
}

export enum AccountType {
  CHECKING = 'CHECKING',
  SAVINGS = 'SAVINGS',
  CREDIT = 'BUSINESS'
}