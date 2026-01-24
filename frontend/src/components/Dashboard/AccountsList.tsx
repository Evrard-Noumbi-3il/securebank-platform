import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAccounts, createAccount} from '../../store/slices/accountSlice';
import AccountCard from '../Dashboard/AccountCard';
import { AccountType } from '../../types/account.types';
import { formatCurrency } from '../../utils/formatters';
import {
  Plus,
  Wallet,
  Loader2,
  X,
  AlertCircle,
  TrendingUp,
  PiggyBank,
  CreditCard,
} from 'lucide-react';

const AccountsList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { accounts, loading, error } = useAppSelector((state) => state.accounts);
  const totalBalance = useAppSelector((state) =>
    state.accounts.accounts.reduce((sum, acc) => sum + acc.balance, 0)
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newAccountType, setNewAccountType] = useState<AccountType>(AccountType.CHECKING);
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAccounts());
  }, [dispatch]);

  const handleCreateAccount = async () => {
    try {
      setCreateLoading(true);
      setCreateError(null);
      await dispatch(createAccount({ accountType: newAccountType, currency: 'EUR' })).unwrap();
      setShowCreateModal(false);
      setNewAccountType(AccountType.CHECKING);
    } catch (err: any) {
      setCreateError(err.message || 'Erreur lors de la création du compte');
    } finally {
      setCreateLoading(false);
    }
  };

  const getAccountTypeIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.CHECKING:
        return <Wallet className="w-6 h-6" />;
      case AccountType.SAVINGS:
        return <PiggyBank className="w-6 h-6" />;
      case AccountType.CREDIT:
        return <CreditCard className="w-6 h-6" />;
      default:
        return <Wallet className="w-6 h-6" />;
    }
  };

  const getAccountTypeDescription = (type: AccountType) => {
    switch (type) {
      case AccountType.CHECKING:
        return 'Compte courant pour vos dépenses quotidiennes';
      case AccountType.SAVINGS:
        return 'Compte d\'épargne pour vos économies';
      case AccountType.CREDIT:
        return 'Compte de crédit pour vos achats à crédit';
      default:
        return '';
    }
  };

  if (loading && accounts.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement de vos comptes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mes Comptes</h1>
          <p className="text-gray-600 mt-1">
            {accounts.length} compte{accounts.length > 1 ? 's' : ''} • Balance totale:{' '}
            <span className="font-semibold text-primary-700">{formatCurrency(totalBalance)}</span>
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Créer un compte</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Wallet className="w-6 h-6 text-blue-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{accounts.length}</p>
          <p className="text-sm text-gray-600 mt-1">Comptes totaux</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(totalBalance)}</p>
          <p className="text-sm text-gray-600 mt-1">Balance totale</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {accounts.filter((acc) => acc.accountType === AccountType.SAVINGS).length}
          </p>
          <p className="text-sm text-gray-600 mt-1">Comptes d'épargne</p>
        </div>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Wallet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun compte</h3>
          <p className="text-gray-600 mb-6">Créez votre premier compte pour commencer</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Créer un compte</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      )}

      {/* Create Account Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Créer un nouveau compte</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                  <p className="text-sm text-red-700">{createError}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de compte
                </label>
                <div className="space-y-3">
                  {Object.values(AccountType).map((type) => (
                    <label
                      key={type}
                      className={`flex items-start p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        newAccountType === type
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="accountType"
                        value={type}
                        checked={newAccountType === type}
                        onChange={() => setNewAccountType(type)}
                        className="mt-1 text-primary-600 focus:ring-primary-500"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          {getAccountTypeIcon(type)}
                          <span className="font-semibold text-gray-900">{type}</span>
                        </div>
                        <p className="text-sm text-gray-600">{getAccountTypeDescription(type)}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center space-x-3 p-6 bg-gray-50 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setCreateError(null);
                }}
                disabled={createLoading}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateAccount}
                disabled={createLoading}
                className="flex-1 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {createLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Création...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    <span>Créer le compte</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsList;