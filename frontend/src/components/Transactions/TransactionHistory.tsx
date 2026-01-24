import React, { useEffect, useState, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchTransactions } from '../../store/slices/transactionSlice';
import TransactionFilters from './TransactionFilters';
import TransactionItem from './TransactionItem';
import { Loader2, FileText, ChevronLeft, ChevronRight } from 'lucide-react';

interface FilterValues {
  search: string;
  type: string;
  status: string;
  dateFrom: string;
  dateTo: string;
}

const ITEMS_PER_PAGE = 10;

const TransactionHistory: React.FC = () => {
  const dispatch = useAppDispatch();
  const { transactions, loading, error } = useAppSelector((state) => state.transactions);
  
  const [filters, setFilters] = useState<FilterValues>({
    search: '',
    type: '',
    status: '',
    dateFrom: '',
    dateTo: '',
  });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchTransactions());
  }, [dispatch]);

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchLower) ||
          t.id.toLowerCase().includes(searchLower) ||
          t.id.includes(searchLower)
      );
    }

    // Type filter
    if (filters.type) {
      filtered = filtered.filter((t) => t.type === filters.type);
    }

    // Status filter
    if (filters.status) {
      filtered = filtered.filter((t) => t.status === filters.status);
    }

    // Date filters
    if (filters.dateFrom) {
      filtered = filtered.filter(
        (t) => new Date(t.createdAt) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(
        (t) => new Date(t.createdAt) <= new Date(filters.dateTo)
      );
    }

    // Sort by date (most recent first)
    filtered.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return filtered;
  }, [transactions, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (newFilters: FilterValues) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des transactions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-700 font-medium">Erreur: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Historique des Transactions</h1>
          <p className="text-gray-600 mt-1">
            {filteredTransactions.length} transaction{filteredTransactions.length > 1 ? 's' : ''} trouvée{filteredTransactions.length > 1 ? 's' : ''}
          </p>
        </div>
        
        <button
          onClick={() => dispatch(fetchTransactions())}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
        >
          Actualiser
        </button>
      </div>

      {/* Filters */}
      <TransactionFilters onFilterChange={handleFilterChange} />

      {/* Transactions List */}
      {paginatedTransactions.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Aucune transaction trouvée
          </h3>
          <p className="text-gray-600">
            {filters.search || filters.type || filters.status || filters.dateFrom || filters.dateTo
              ? 'Essayez de modifier vos filtres'
              : 'Vos transactions apparaîtront ici'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedTransactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span> sur{' '}
            <span className="font-medium">{totalPages}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {[...Array(totalPages)].map((_, i) => {
              const page = i + 1;
              // Show first page, last page, current page, and pages around current
              if (
                page === 1 ||
                page === totalPages ||
                (page >= currentPage - 1 && page <= currentPage + 1)
              ) {
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      currentPage === page
                        ? 'bg-primary-600 text-white'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              } else if (page === currentPage - 2 || page === currentPage + 2) {
                return (
                  <span key={page} className="px-2 text-gray-400">
                    ...
                  </span>
                );
              }
              return null;
            })}

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;