import React from 'react';
import { Transaction} from '../../types/transaction.types';
import { formatCurrency, formatDateTime, formatStatus } from '../../utils/formatters';
import { X, ArrowUpRight, ArrowDownLeft, CheckCircle, Clock, XCircle, Ban, Calendar, FileText, Wallet } from 'lucide-react';

interface TransactionDetailsModalProps {
  transaction: Transaction;
  onClose: () => void;
}

const TransactionDetailsModal: React.FC<TransactionDetailsModalProps> = ({ transaction, onClose }) => {
  const isDebit = transaction.type === "WITHDRAWAL" || transaction.type === "PAYMENT" || transaction.type === "TRANSFER_OUT";
  const isCredit = transaction.type === "DEPOSIT" || transaction.type === "TRANSFER_IN";

  const getStatusIcon = () => {
    switch (transaction.status) {
      case "COMPLETED":
        return <CheckCircle className="w-12 h-12 text-green-500" />;
      case "PENDING":
        return <Clock className="w-12 h-12 text-yellow-500" />;
      case "FAILED":
        return <XCircle className="w-12 h-12 text-red-500" />;
      case "CANCELLED":
        return <Ban className="w-12 h-12 text-gray-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (transaction.status) {
      case "COMPLETED":
        return 'bg-green-50 border-green-200';
      case "PENDING":
        return 'bg-yellow-50 border-yellow-200';
      case "FAILED":
        return 'bg-red-50 border-red-200';
      case "CANCELLED":
        return 'bg-gray-50 border-gray-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTypeLabel = () => {
    switch (transaction.type) {
      case "DEPOSIT":
        return 'Dépôt';
      case "WITHDRAWAL":
        return 'Retrait';
      case "TRANSFER_IN":
        return 'Virement entrant';
      case "TRANSFER_OUT":
        return 'Virement sortant';
      case "PAYMENT":
        return 'Paiement';
      default:
        return transaction.type;
    }
  };

  const getTypeIcon = () => {
    if (isCredit) {
      return (
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <ArrowUpRight className="w-8 h-8 text-green-600" />
        </div>
      );
    }
    if (isDebit) {
      return (
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
          <ArrowDownLeft className="w-8 h-8 text-red-600" />
        </div>
      );
    }
    return null;
  };

  const getStatusMessage = () => {
    switch (transaction.status) {
      case "COMPLETED":
        return 'Transaction effectuée avec succès';
      case "PENDING":
        return 'Transaction en cours de traitement';
      case "FAILED":
        return 'Échec de la transaction';
      case "CANCELLED":
        return 'Transaction annulée';
      default:
        return '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">Détails de la Transaction</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status Section */}
          <div className={`${getStatusColor()} border rounded-xl p-6 text-center`}>
            <div className="flex justify-center mb-4">
              {getStatusIcon()}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {formatStatus(transaction.status)}
            </h3>
            <p className="text-sm text-gray-600">
              {getStatusMessage()}
            </p>
          </div>

          {/* Amount Section */}
          <div className="text-center py-6 border-b border-gray-200">
            <p className="text-sm text-gray-600 mb-2">Montant</p>
            <div className="flex items-center justify-center space-x-2">
              {getTypeIcon()}
              <p className={`text-5xl font-bold ${isDebit ? 'text-red-600' : 'text-green-600'}`}>
                {isDebit ? '-' : '+'} {formatCurrency(transaction.amount)}
              </p>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
              Informations de la transaction
            </h4>

            {/* Description */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
              </div>
            </div>

            {/* Transaction Type */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <ArrowUpRight className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Type de transaction</p>
                <p className="text-sm font-medium text-gray-900">{getTypeLabel()}</p>
              </div>
            </div>

            {/* Account ID */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Wallet className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">
                  Compte concerné
                </p>
                <p className="text-sm font-medium text-gray-900 font-mono">
                  IBAN: {transaction.toAccountId}
                </p>
              </div>
            </div>

            {/* Transaction Date */}
            <div className="flex items-start space-x-3 p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-xs text-gray-500 mb-1">Date et heure</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDateTime(transaction.createdAt)}
                </p>
              </div>
            </div>

            
          </div>

          {/* Additional Info based on Status */}
          {transaction.status === "FAILED" && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-red-900 mb-2">
                Raison de l'échec
              </h5>
              <p className="text-sm text-red-700">
                La transaction a échoué. Veuillez vérifier le solde de votre compte ou contacter le support.
              </p>
            </div>
          )}

          {transaction.status === "PENDING" && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-yellow-900 mb-2">
                Transaction en attente
              </h5>
              <p className="text-sm text-yellow-700">
                Cette transaction est en cours de traitement. Elle sera complétée dans quelques instants.
              </p>
            </div>
          )}

          {transaction.status === "CANCELLED" && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="text-sm font-semibold text-gray-900 mb-2">
                Transaction annulée
              </h5>
              <p className="text-sm text-gray-700">
                Cette transaction a été annulée et n'a pas été effectuée.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionDetailsModal;