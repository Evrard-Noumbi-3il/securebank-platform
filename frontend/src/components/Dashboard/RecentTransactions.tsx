import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { Transaction } from '../../types/transaction.types';
import { formatCurrency, formatDateTime, formatStatus } from '../../utils/formatters';

interface RecentTransactionsProps {
  transactions: Transaction[];
  loading: boolean;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ transactions, loading }) => {

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return <ArrowUpRight className="h-5 w-5 text-green-600" />;
      case 'WITHDRAWAL':
        return <ArrowDownLeft className="h-5 w-5 text-red-600" />;
      case 'TRANSFER_OUT':
        return <ArrowDownLeft className="h-5 w-5 text-red-600" />;
      case 'TRANSFER_IN':
        return <ArrowUpRight className="h-5 w-5 text-green-600" />;
      case 'PAYMENT':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'PENDING':
        return <Clock className="h-5 w-5 text-yellow-600" />;
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'text-green-600';
      case 'TRANSFER_IN':
        return 'text-green-600';
      case 'WITHDRAWAL':
        return 'text-red-600';
      case 'PAYMENT':
        return 'text-red-600';
      case 'TRANSFER_OUT':
        return 'text-red-600';
      default:
        return 'text-gray-900';
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Transactions Récentes</h2>
        <Link
          to="/transactions"
          className="text-sm text-primary-600 hover:text-primary-700 font-medium transition"
        >
          Voir tout →
        </Link>
      </div>

      {/* Liste des transactions */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-4 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-6 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12">
          <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">Aucune transaction récente</p>
          <p className="text-sm text-gray-500 mt-2">
            Vos transactions apparaîtront ici
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition cursor-pointer"
            >
              {/* Icône type transaction */}
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  {getTransactionIcon(transaction.type)}
                </div>
              </div>

              {/* Info transaction */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {transaction.description || 'Transaction'}
                  </p>
                  {getStatusIcon(transaction.status)}
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <p className="text-xs text-gray-500">
                    {formatDateTime(transaction.createdAt)}
                  </p>
                  <span className="text-xs text-gray-400">•</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    transaction.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-700'
                      : transaction.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {formatStatus(transaction.status)}
                  </span>
                </div>
              </div>

              {/* Montant */}
              <div className="flex-shrink-0 text-right">
                <p className={`text-lg font-semibold ${getAmountColor(transaction.type)}`}>
                  {transaction.type === 'DEPOSIT' || transaction.type === 'TRANSFER_IN' ? '+' : '-'}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer avec action */}
      {!loading && transactions.length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <Link
            to="/transactions"
            className="flex items-center justify-center space-x-2 text-sm text-primary-600 hover:text-primary-700 font-medium transition"
          >
            <span>Voir toutes les transactions</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </div>
  );
};

export default RecentTransactions;