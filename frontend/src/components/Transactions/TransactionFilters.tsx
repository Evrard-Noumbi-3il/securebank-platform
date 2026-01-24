import React, { useState } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';


interface FilterValues {
  search: string;
  type: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

interface TransactionFiltersProps {
  onFilterChange: (filters: FilterValues) => void;
}

const TransactionFilters: React.FC<TransactionFiltersProps> = ({ onFilterChange }) => {
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });

  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleFilterChange = (key: keyof FilterValues, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      type: '',
      status: '',
      dateFrom: '',
      dateTo: '',
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== '');

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
      {/* Search Bar */}
      <div className="flex items-center space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Rechercher par description, référence..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
            showAdvanced
              ? 'bg-primary-50 border-primary-300 text-primary-700'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Filter className="w-5 h-5" />
          <span className="font-medium">Filtres</span>
        </button>

        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg hover:bg-red-100 transition-colors"
          >
            <X className="w-5 h-5" />
            <span className="font-medium">Réinitialiser</span>
          </button>
        )}
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de transaction
            </label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Tous les types</option>
              <option value={"DEPOSIT"}>Crédit</option>
              <option value={"WITHDRAWAL"}>Débit</option>
              <option value={"TRANSFERT_IN"}>Virement entrant</option>
              <option value={"TRANSFER_OUT"}>Virement sortant</option>
              <option value={"PAYMENT"}>Paiement</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Tous les statuts</option>
              <option value={"COMPLETED"}>Complété</option>
              <option value={"PENDING"}>En attente</option>
              <option value={"FAILED"}>Échoué</option>
              <option value={"CANCELLED"}>Annulé</option>
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date de début
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="inline w-4 h-4 mr-1" />
              Date de fin
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center space-x-2 pt-2 border-t border-gray-200">
          <span className="text-sm text-gray-600">Filtres actifs:</span>
          {filters.search && (
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
              Recherche: "{filters.search}"
            </span>
          )}
          {filters.type && (
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
              Type: {filters.type}
            </span>
          )}
          {filters.status && (
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
              Statut: {filters.status}
            </span>
          )}
          {(filters.dateFrom || filters.dateTo) && (
            <span className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-xs font-medium">
              Période: {filters.dateFrom || '...'} → {filters.dateTo || '...'}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TransactionFilters;