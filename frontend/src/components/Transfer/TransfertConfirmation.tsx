import React from 'react';
import { TransferRequest } from '../../types/transaction.types';
import { Account } from '../../types/account.types';
import { formatCurrency, formatAccountNumber } from '../../utils/formatters';
import { X, AlertTriangle, ArrowRight, CheckCircle } from 'lucide-react';

interface TransferConfirmationProps {
  transferData: TransferRequest;
  fromAccount: Account;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

const TransferConfirmation: React.FC<TransferConfirmationProps> = ({
  transferData,
  fromAccount,
  onConfirm,
  onCancel,
  loading,
}) => {
  if (!fromAccount) {
    return null; 
  }
  const newBalance = fromAccount.balance - transferData.amount;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Confirmer le virement</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={loading}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Veuillez vérifier attentivement les informations avant de confirmer. Cette action est irréversible.
            </p>
          </div>

          {/* Transfer Details */}
          <div className="space-y-4">
            {/* From Account */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium uppercase mb-2">Compte source</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{fromAccount.accountType}</p>
                  <p className="text-sm text-gray-600">
                    {formatAccountNumber(fromAccount.accountNumber)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">Solde actuel</p>
                  <p className="font-semibold text-gray-900">
                    {formatCurrency(fromAccount.balance)}
                  </p>
                </div>
              </div>
            </div>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-primary-600" />
              </div>
            </div>

            {/* To Account */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium uppercase mb-2">Compte bénéficiaire</p>
              <p className="font-semibold text-gray-900">
                {formatAccountNumber(transferData.toAccountNumber)}
              </p>
            </div>

            {/* Amount */}
            <div className="bg-primary-50 border-2 border-primary-200 rounded-lg p-6 text-center">
              <p className="text-sm text-primary-600 font-medium mb-2">Montant du virement</p>
              <p className="text-4xl font-bold text-primary-700">
                {formatCurrency(transferData.amount)}
              </p>
            </div>

            {/* Description */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-500 font-medium uppercase mb-2">Description</p>
              <p className="text-gray-900">{transferData.description}</p>
            </div>

            {/* New Balance */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Nouveau solde après virement</p>
                  <p className="text-xs text-blue-500 mt-1">
                    {formatCurrency(fromAccount.balance)} - {formatCurrency(transferData.amount)}
                  </p>
                </div>
                <p className={`text-2xl font-bold ${newBalance >= 0 ? 'text-blue-700' : 'text-red-600'}`}>
                  {formatCurrency(newBalance)}
                </p>
              </div>
            </div>
          </div>

          {/* Warning if balance will be low */}
          {newBalance < 100 && newBalance >= 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">Attention</p>
                <p className="text-sm text-orange-700 mt-1">
                  Votre solde sera faible après ce virement. Assurez-vous d'avoir suffisamment de fonds pour vos prochaines dépenses.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center space-x-3 p-6 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Annuler
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Traitement...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                <span>Confirmer le virement</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransferConfirmation;