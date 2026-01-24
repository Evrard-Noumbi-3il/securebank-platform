import React, { useState } from 'react';
import { Transaction, TransactionStatus } from '../../types/transaction.types';
import { formatCurrency, formatDateTime, formatStatus } from '../../utils/formatters';
import { ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Ban } from 'lucide-react';
import TransactionDetailsModal from './TransactionDetailModal';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  const [showDetails, setShowDetails] = useState(false);

  const isDebit = transaction.type === "WITHDRAWAL" || transaction.type === "PAYMENT" || transaction.type === "TRANSFER_OUT";
  const isCredit = transaction.type === "DEPOSIT" || transaction.type === "TRANSFER_IN";

  const getStatusIcon = () => {
    switch (transaction.status) {
      case "COMPLETED":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "PENDING":
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case "FAILED":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'CANCELLED':
        return <Ban className="w-5 h-5 text-gray-400" />;
      default:
        return null;
    }
  };

  const getStatusBadge = () => {
    const statusConfig: Record<TransactionStatus, string> = {
      COMPLETED: 'bg-green-50 text-green-700 border-green-200',
      PENDING: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      FAILED: 'bg-red-50 text-red-700 border-red-200',
      CANCELLED: 'bg-gray-50 text-gray-700 border-gray-200',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[transaction.status]}`}>
        {formatStatus(transaction.status)}
      </span>
    );
  };

  const getTransactionIcon = () => {
    if (isDebit) {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-red-50 rounded-full">
          <ArrowDownLeft className="w-5 h-5 text-red-600" />
        </div>
      );
    }
    if (isCredit) {
      return (
        <div className="flex items-center justify-center w-10 h-10 bg-green-50 rounded-full">
          <ArrowUpRight className="w-5 h-5 text-green-600" />
        </div>
      );
    }
    return null;
  };

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-primary-300 transition-all duration-200 cursor-pointer"
      >
        {/* Left section - Icon + Details */}
        <div className="flex items-center space-x-4 flex-1">
          {getTransactionIcon()}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {transaction.description}
              </p>
              {getStatusIcon()}
            </div>
            
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-xs text-gray-500">
                {formatDateTime(transaction.createdAt)}
              </p>
              <p className="text-xs text-gray-400">
                Réf: {String(transaction.id).substring(0, 8)}...
              </p>
            </div>
          </div>
        </div>

        {/* Right section - Amount + Status */}
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className={`text-lg font-bold ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
              {isDebit ? '-' : '+'} {formatCurrency(transaction.amount)}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              ID: {String(transaction.id).substring(0, 8)}
            </p>
          </div>
          
          {getStatusBadge()}
        </div>
      </div>

      {/* Modal */}
      {showDetails && (
        <TransactionDetailsModal
          transaction={transaction}
          onClose={() => setShowDetails(false)}
        />
      )}
    </>
  );
};

export default TransactionItem;