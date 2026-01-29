import React from 'react';
import { Link } from 'react-router-dom';
import { Wallet, CreditCard, Eye, Send } from 'lucide-react';
import { Account } from '../../types/account.types';
import { formatCurrency, formatAccountNumber } from '../../utils/formatters';

interface AccountCardProps {
  account: Account;
}

const AccountCard: React.FC<AccountCardProps> = ({ account }) => {
  const AccountIcon = account.accountType === 'CHECKING' ? CreditCard : Wallet;
  const colorClasses = account.accountType === 'CHECKING'
    ? 'from-blue-500 to-blue-700'
    : 'from-purple-500 to-purple-700';

  return (
    <div className={`bg-gradient-to-br ${colorClasses} text-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <AccountIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-sm opacity-90">
              {account.accountType === 'CHECKING' ? 'Compte Courant' : 'Compte Épargne'}
            </p>
            <p className="text-xs opacity-75 font-mono">
              {formatAccountNumber(account.accountNumber)}
            </p>
          </div>
        </div>
        
        {/* Badge statut */}
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          account.status === 'ACTIVE' 
            ? 'bg-green-400/30 text-green-100' 
            : 'bg-red-400/30 text-red-100'
        }`}>
          {account.status === 'ACTIVE' ? 'Actif' : 'Inactif'}
        </span>
      </div>

      {/* Balance */}
      <div className="mb-6">
        <p className="text-sm opacity-90 mb-1">Solde disponible</p>
        <p className="text-3xl font-bold">
          {formatCurrency(account.balance, account.currency)}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-3">
        <Link
          to={`/accounts/${account.id}/details`}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition backdrop-blur-sm"
        >
          <Eye className="h-4 w-4" />
          <span className="text-sm font-medium">Détails</span>
        </Link>
        
        <Link
          to={`/transfer?from=${account.id}`}
          className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-white text-primary-600 hover:bg-gray-100 rounded-lg transition"
        >
          <Send className="h-4 w-4" />
          <span className="text-sm font-medium">Virer</span>
        </Link>
      </div>
    </div>
  );
};

export default AccountCard;