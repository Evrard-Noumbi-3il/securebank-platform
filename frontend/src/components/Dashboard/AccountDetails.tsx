import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { selectAccounts, fetchAccounts } from '../../store/slices/accountSlice';
import { fetchAccountTransactions } from '../../store/slices/transactionSlice';
import { isDebitTransaction, isCreditTransaction } from '../../types/transaction.types';
import TransactionItem from '../Transactions/TransactionItem';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import {
  ArrowLeft,
  Wallet,
  CreditCard,
  PiggyBank,
  Calendar,
  Activity,
  TrendingUp,
  TrendingDown,
  Send,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react';

const AccountDetails: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const accounts = useAppSelector(selectAccounts);
  const { loading: accountsLoading } = useAppSelector((state) => state.accounts);
  const { transactions, loading, error } = useAppSelector((state) => state.transactions);
  
  const [showAllTransactions, setShowAllTransactions] = useState(false);


  const account = accounts.find((acc) => String(acc.id) === String(accountId));


  useEffect(() => {
    if (accounts.length === 0) {
      dispatch(fetchAccounts());
    }
  }, [dispatch, accounts.length]);

  useEffect(() => {
    if (accountId) {
      dispatch(fetchAccountTransactions(accountId));
    }
  }, [dispatch, accountId]);

  if (accountsLoading && !account) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du compte...</p>
        </div>
      </div>
    );
  }


  if (!account && accounts.length > 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-red-900 mb-2">Compte introuvable</h3>
          <p className="text-red-700 mb-4">Le compte demandé n'existe pas ou vous n'y avez pas accès.</p>
          <button
            onClick={() => navigate('/accounts')}
            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium"
          >
            Retour aux comptes
          </button>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  const getAccountIcon = () => {
    switch (account.accountType) {
      case 'CHECKING':
        return <CreditCard className="w-8 h-8" />;
      case 'SAVINGS':
        return <PiggyBank className="w-8 h-8" />;
      case 'CREDIT':
        return <Wallet className="w-8 h-8" />;
      default:
        return <Wallet className="w-8 h-8" />;
    }
  };

  const getAccountTypeName = () => {
    switch (account.accountType) {
      case 'CHECKING':
        return 'Compte Courant';
      case 'SAVINGS':
        return 'Compte Épargne';
      case 'CREDIT':
        return 'Compte Crédit';
      default:
        return account.accountType;
    }
  };

  const getAccountColorClasses = () => {
    switch (account.accountType) {
      case 'CHECKING':
        return 'from-blue-500 to-blue-700';
      case 'SAVINGS':
        return 'from-purple-500 to-purple-700';
      case 'CREDIT':
        return 'from-green-500 to-green-700';
      default:
        return 'from-gray-500 to-gray-700';
    }
  };

  const totalIncome = transactions
    .filter((t) => isCreditTransaction(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => isDebitTransaction(t.type))
    .reduce((sum, t) => sum + t.amount, 0);

  const displayedTransactions = showAllTransactions ? transactions : transactions.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/accounts')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Retour aux comptes</span>
        </button>

        <Link
          to={`/transfer?from=${account.id}`}
          className="flex items-center space-x-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          <Send className="w-5 h-5" />
          <span>Effectuer un virement</span>
        </Link>
      </div>

      {/* Account Card */}
      <div className={`bg-gradient-to-br ${getAccountColorClasses()} text-white rounded-2xl shadow-xl p-8`}>
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              {getAccountIcon()}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{getAccountTypeName()}</h1>
              <p className="text-sm opacity-90 font-mono mt-1">
                {account.accountNumber}
              </p>
            </div>
          </div>

          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            account.status === 'ACTIVE' 
              ? 'bg-green-400/30 text-green-100' 
              : 'bg-red-400/30 text-red-100'
          }`}>
            {account.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm opacity-90 mb-2">Solde disponible</p>
            <p className="text-4xl font-bold">{formatCurrency(account.balance)}</p>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-90">Date de création</span>
              <span className="font-medium">{formatDateTime(account.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-90">Devise</span>
              <span className="font-medium">{account.currency}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="opacity-90">ID Compte</span>
              <span className="font-mono text-xs">{account.id}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
          <p className="text-sm text-gray-600 mt-1">Revenus totaux</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpense)}</p>
          <p className="text-sm text-gray-600 mt-1">Dépenses totales</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
          <p className="text-sm text-gray-600 mt-1">Transactions</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Historique des transactions</h2>
              <p className="text-sm text-gray-600">
                {transactions.length} transaction{transactions.length > 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
          >
            <Download className="w-5 h-5" />
            <span>Exporter</span>
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">Chargement des transactions...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-12">
            <Activity className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Aucune transaction
            </h3>
            <p className="text-gray-600">
              Les transactions de ce compte apparaîtront ici
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {displayedTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))}
            </div>

            {!showAllTransactions && transactions.length > 10 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAllTransactions(true)}
                  className="px-6 py-2 bg-primary-50 hover:bg-primary-100 text-primary-700 rounded-lg font-medium transition-colors"
                >
                  Afficher toutes les transactions ({transactions.length})
                </button>
              </div>
            )}

            {showAllTransactions && transactions.length > 10 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setShowAllTransactions(false)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium transition-colors"
                >
                  Afficher moins
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AccountDetails;