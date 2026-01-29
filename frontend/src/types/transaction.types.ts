export type TransactionType = 'TRANSFER' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT';
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export interface Transaction {
  id: string;
  fromAccountId: string;
  toAccountId: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  reference: string;
  referenceId?: string; 
  createdAt: string;
  completedAt?: string;

}

export interface TransferRequest {
  fromAccountId: string;
  toAccountNumber: string;
  amount: number;
  description: string;
}

export interface TransactionState {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
}



/**
 * Détermine si une transaction est un débit (sortie d'argent)
 */
export const isDebitTransaction = (type: TransactionType): boolean => {
    return ['WITHDRAWAL', 'PAYMENT', 'TRANSFER_OUT', 'TRANSFER'].includes(type);

};

/**
 * Détermine si une transaction est un crédit (entrée d'argent)
 */
export const isCreditTransaction = (type: TransactionType): boolean => {
    return ['DEPOSIT', 'TRANSFER_IN'].includes(type);
};

/**
 * Obtenir le label français d'un type de transaction
 */
export const getTransactionTypeLabel = (type: TransactionType): string => {
  const labels: Record<TransactionType, string> = {
  TRANSFER: 'Virement',
  TRANSFER_IN: 'Virement entrant',
  TRANSFER_OUT: 'Virement sortant',
  DEPOSIT: 'Dépôt',
  WITHDRAWAL: 'Retrait',
  PAYMENT: 'Paiement',
};
  return labels[type] || type;
};

/**
 * Obtenir le label français d'un statut
 */
export const getTransactionStatusLabel = (status: TransactionStatus): string => {
  const labels: Record<TransactionStatus, string> = {
    PENDING: 'En attente',
    COMPLETED: 'Complété',
    FAILED: 'Échoué',
    CANCELLED: 'Annulé',
  };
  return labels[status] || status;
};