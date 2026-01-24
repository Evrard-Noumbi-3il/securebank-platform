import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Wallet, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchAccounts, selectAccounts, selectTotalBalance, selectAccountsLoading } from '../../store/slices/accountSlice';
import { fetchTransactions, selectRecentTransactions, selectTransactionsLoading } from '../../store/slices/transactionSlice';
import { selectUser } from '../../store/slices/authSlice';
import { formatCurrency } from '../../utils/formatters';
import AccountCard from './AccountCard';
import RecentTransactions from './RecentTransactions';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Account } from '../../types/account.types';

const Dashboard: React.FC = () => {
  const dispatch = useAppDispatch();
  
  const user = useAppSelector(selectUser);
  const accounts = useAppSelector(selectAccounts);
  const totalBalance = useAppSelector(selectTotalBalance);
  const recentTransactions = useAppSelector(selectRecentTransactions);
  const accountsLoading = useAppSelector(selectAccountsLoading);
  const transactionsLoading = useAppSelector(selectTransactionsLoading);

  useEffect(() => {
    dispatch(fetchAccounts());
    dispatch(fetchTransactions());
  }, [dispatch]);

  // Données du graphique (simulées pour démo)
  const chartData = [
    { name: 'Jan', balance: 8000 },
    { name: 'Fév', balance: 8500 },
    { name: 'Mar', balance: 9200 },
    { name: 'Avr', balance: 8800 },
    { name: 'Mai', balance: 9500 },
    { name: 'Juin', balance: totalBalance },
  ];

  // Calculer les statistiques
  const totalIncome = recentTransactions
    .filter(t => t.type === 'DEPOSIT' || t.type === 'TRANSFER_IN')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = recentTransactions
    .filter(t => t.type === 'WITHDRAWAL' || t.type === 'TRANSFER_OUT' || t.type === 'PAYMENT')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Bienvenue, {user?.firstName} 👋
          </h1>
          <p className="text-gray-600 mt-1">
            Voici un aperçu de vos comptes et transactions
          </p>
        </div>
        <Link
          to="/accounts/new"
          className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <Plus className="h-5 w-5 mr-2" />
          Nouveau compte
        </Link>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance */}
        <div className="bg-gradient-to-br from-primary-500 to-primary-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg">
              <Wallet className="h-6 w-6" />
            </div>
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-sm opacity-90">Balance Totale</p>
          <p className="text-3xl font-bold mt-2">
            {accountsLoading ? '...' : formatCurrency(totalBalance)}
          </p>
        </div>

        {/* Revenus */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-50 rounded-lg">
              <ArrowDownRight className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Revenus ce mois</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {transactionsLoading ? '...' : formatCurrency(totalIncome)}
          </p>
          <p className="text-xs text-green-600 mt-2">+12% vs mois dernier</p>
        </div>

        {/* Dépenses */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-50 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Dépenses ce mois</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {transactionsLoading ? '...' : formatCurrency(totalExpenses)}
          </p>
          <p className="text-xs text-red-600 mt-2">+5% vs mois dernier</p>
        </div>
      </div>

      {/* Graphique */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Évolution de votre balance
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis stroke="#888" />
            <Tooltip
              formatter={(value: number) => formatCurrency(value)}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
              }}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mes Comptes */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Mes Comptes</h2>
          <Link
            to="/accounts"
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition"
          >
            Voir tous →
          </Link>
        </div>

        {accountsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-200 rounded-2xl h-48 animate-pulse" />
            ))}
          </div>
        ) : accounts.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center">
            <Wallet className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Vous n'avez pas encore de compte</p>
            <Link
              to="/accounts/new"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <Plus className="h-4 w-4 mr-2" />
              Créer mon premier compte
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.slice(0, 3).map((account: Account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </div>

      {/* Transactions Récentes */}
      <RecentTransactions transactions={recentTransactions} loading={transactionsLoading} />
    </div>
  );
};

export default Dashboard;