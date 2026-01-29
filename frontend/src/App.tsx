import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from './store/hooks';
import { selectIsAuthenticated, restoreAuth } from './store/slices/authSlice';

{/* Auth Components */}
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import PrivateRoute from './components/Auth/PrivateRoute';

{/* Dashboard */}
import Dashboard from './components/Dashboard/Dashboard';

{/* Accounts */}
import AccountsList from './components/Dashboard/AccountsList';
import AccountDetails from './components/Dashboard/AccountDetails';

{/* Transactions */}
import TransactionHistory from './components/Transactions/TransactionHistory';

{/* Transfer */}
import TransferForm from './components/Transfer/TransfertForm';

{/* Placeholder for Settings (not yet implemented) */}
const SettingsPage = () => (
  <div className="p-6">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Paramètres</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <p className="text-gray-600 text-lg">Cette page sera bientôt disponible</p>
        <p className="text-gray-500 text-sm mt-2">
          Vous pourrez ici gérer vos préférences, notifications et paramètres de sécurité
        </p>
      </div>
    </div>
  </div>
);

function App() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  useEffect(() => {
    dispatch(restoreAuth());
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Redirect root based on authentication */}
        <Route
          path="/"
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Accounts */}
          <Route path="/accounts" element={<AccountsList />} />
          <Route path="/accounts/:accountId/details" element={<AccountDetails />} />
          
          {/* Transactions */}
          <Route path="/transactions" element={<TransactionHistory />} />
          
          {/* Transfer */}
          <Route path="/transfer" element={<TransferForm />} />
          
          {/* Settings (not yet implemented) */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* 404 - Redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;