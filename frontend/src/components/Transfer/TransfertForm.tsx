import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAccounts } from '../../store/slices/accountSlice';
import { makeTransfer } from '../../store/slices/transactionSlice';
import TransferConfirmation from '../../components/Transfer/TransfertConfirmation';
import { TransferRequest } from '../../types/transaction.types';
import { formatCurrency, formatAccountNumber } from '../../utils/formatters';
import { Send, Wallet, ArrowRight, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

const TransferForm: React.FC = () => {
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const { accounts, loading: accountsLoading } = useAppSelector((state) => state.accounts);
  const { loading: transferLoading } = useAppSelector((state) => state.transactions);

  const fromAccountId = searchParams.get('form') || '';

  const [formData, setFormData] = useState<TransferRequest>({
    fromAccountId: fromAccountId,
    toAccountNumber: '',
    amount: 0,
    description: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [transferSuccess, setTransferSuccess] = useState(false);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const selectedAccount = accounts.find((acc) => String(acc.id) === String(formData.fromAccountId));

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fromAccountId) {
      newErrors.fromAccountId = 'Veuillez sélectionner un compte source';
    }

    if (!formData.toAccountNumber) {
      newErrors.toAccountNumber = 'Veuillez entrer un numéro de compte bénéficiaire';
    } else if (formData.toAccountNumber === selectedAccount?.accountNumber) {
      newErrors.toAccountNumber = 'Le compte bénéficiaire doit être différent du compte source';
    }

    if (formData.amount <= 0) {
      newErrors.amount = 'Le montant doit être supérieur à 0';
    } else if (selectedAccount && formData.amount > selectedAccount.balance) {
      newErrors.amount = `Solde insuffisant (disponible: ${formatCurrency(selectedAccount.balance)})`;
    }

    if (!formData.description || formData.description.trim().length < 3) {
      newErrors.description = 'La description doit contenir au moins 3 caractères';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setShowConfirmation(true);
    }
  };

  const handleConfirmTransfer = async () => {
    console.log("Bouton cliqué !");
    try {
      await dispatch(makeTransfer(formData)).unwrap();
      setTransferSuccess(true);
      setShowConfirmation(false);
      
      setTimeout(() => {
        setFormData({
          fromAccountId: '',
          toAccountNumber: '',
          amount: 0,
          description: '',
        });
        setTransferSuccess(false);
        dispatch(fetchAccounts()); 
      }, 2000);
    } catch (error) {
      console.error('Transfer failed:', error);
    }
  };

  const handleInputChange = (field: keyof TransferRequest, value: string | number) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mx-auto mb-4">
          <Send className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Nouveau Virement</h1>
        <p className="text-gray-600 mt-2">Transférez de l'argent vers un autre compte</p>
      </div>

      {/* Success Message */}
      {transferSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <Send className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-green-800">Virement effectué avec succès !</h3>
            <p className="text-sm text-green-700 mt-1">
              Le montant de {formatCurrency(formData.amount)} a été transféré.
            </p>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
        {/* From Account */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Wallet className="w-4 h-4 mr-2" />
            Compte source
          </label>
          <select
            value={formData.fromAccountId}
            onChange={(e) => handleInputChange('fromAccountId', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.fromAccountId ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={accountsLoading}
          >
            <option value="">Sélectionnez un compte</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.accountType} - {formatAccountNumber(account.accountNumber)} (
                {formatCurrency(account.balance)})
              </option>
            ))}
          </select>
          {errors.fromAccountId && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.fromAccountId}
            </p>
          )}
          
          {selectedAccount && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                Solde disponible: <span className="font-semibold text-gray-900">{formatCurrency(selectedAccount.balance)}</span>
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-center">
          <ArrowRight className="w-6 h-6 text-gray-400" />
        </div>

        {/* To Account */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Wallet className="w-4 h-4 mr-2" />
            Compte bénéficiaire
          </label>
          <input
            type="text"
            placeholder="Entrez le numéro de compte (ex: ACC123456)"
            value={formData.toAccountNumber}
            onChange={(e) => handleInputChange('toAccountNumber', e.target.value)}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
              errors.toAccountNumber ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.toAccountNumber && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.toAccountNumber}
            </p>
          )}
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.amount || ''}
              onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
              className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                errors.amount ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">
              €
            </span>
          </div>
          {errors.amount && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.amount}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            placeholder="Motif du virement (ex: Remboursement, Cadeau, etc.)"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            rows={3}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.description && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <AlertCircle className="w-4 h-4 mr-1" />
              {errors.description}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={transferLoading || accountsLoading || !formData.fromAccountId}
          className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {transferLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Traitement en cours...</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Effectuer le virement</span>
            </>
          )}
        </button>
      </form>

      {/* Confirmation Modal */}
      {showConfirmation && (
        <TransferConfirmation
          transferData={formData}
          fromAccount={selectedAccount!}
          onConfirm={handleConfirmTransfer}
          onCancel={() => setShowConfirmation(false)}
          loading={transferLoading}
        />
      )}
    </div>
  );
};

export default TransferForm;