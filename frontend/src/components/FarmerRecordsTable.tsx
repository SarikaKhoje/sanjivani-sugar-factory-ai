import React, { useState, useMemo } from 'react';
import {
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Filter,
  RotateCcw,
  CheckCircle2,
  Clock,
  Eye,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { FarmerRecord } from '../types/farmer';
import { formatCurrency, formatTonnes } from '../utils/formatters';

interface FarmerRecordsTableProps {
  farmers: FarmerRecord[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  onSelectFarmer: (farmer: FarmerRecord) => void;
  onAskAIAboutFarmer: (farmerName: string) => void;
  initialSearchQuery?: string;
}

type SortField = 'id' | 'name' | 'sugarcane_supplied_tonnes' | 'payment_pending_amount' | 'amount_paid';
type SortDirection = 'asc' | 'desc';
type StatusFilter = 'ALL' | 'PAID' | 'PENDING';

export const FarmerRecordsTable: React.FC<FarmerRecordsTableProps> = ({
  farmers,
  isLoading,
  error,
  onRetry,
  onSelectFarmer,
  onAskAIAboutFarmer,
  initialSearchQuery = '',
}) => {
  const [search, setSearch] = useState(initialSearchQuery);
  const [sortField, setSortField] = useState<SortField>('id');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');

  // Handle column header click for sorting
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default to descending for quantities and amounts
      setSortDirection(field === 'sugarcane_supplied_tonnes' || field === 'payment_pending_amount' ? 'desc' : 'asc');
    }
  };

  // Filter and Sort logic
  const filteredAndSortedFarmers = useMemo(() => {
    return farmers
      .filter((farmer) => {
        // Status filter
        if (statusFilter !== 'ALL' && farmer.payment_status !== statusFilter) {
          return false;
        }

        // Search text matching name or village
        if (search.trim()) {
          const q = search.toLowerCase().trim();
          const matchesName = farmer.name.toLowerCase().includes(q);
          const matchesVillage = farmer.village.toLowerCase().includes(q);
          const matchesId = farmer.id.toString() === q;
          return matchesName || matchesVillage || matchesId;
        }

        return true;
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        if (typeof valA === 'string') {
          return sortDirection === 'asc'
            ? (valA as string).localeCompare(valB as string)
            : (valB as string).localeCompare(valA as string);
        }

        return sortDirection === 'asc'
          ? (valA as number) - (valB as number)
          : (valB as number) - (valA as number);
      });
  }, [farmers, search, statusFilter, sortField, sortDirection]);

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'ALL' || sortField !== 'id' || sortDirection !== 'asc';

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('ALL');
    setSortField('id');
    setSortDirection('asc');
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 inline ml-1" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-forest-700 inline ml-1" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-forest-700 inline ml-1" />
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Farmer Records Directory</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified intake records from PostgreSQL database
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search box inside table */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search farmer or village..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl outline-none focus:border-forest-600 focus:ring-1 focus:ring-forest-600 transition-all"
            />
          </div>

          {/* Status Filter buttons */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                statusFilter === 'ALL'
                  ? 'bg-white text-forest-900 shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({farmers.length})
            </button>
            <button
              onClick={() => setStatusFilter('PAID')}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                statusFilter === 'PAID'
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-emerald-700'
              }`}
            >
              Fully Paid
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-2.5 py-1 rounded-lg transition-all font-medium ${
                statusFilter === 'PENDING'
                  ? 'bg-amber-600 text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              Pending
            </button>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all font-medium"
              title="Reset all filters and sorting"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-3 border-forest-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-3 text-xs font-semibold text-slate-600">Loading farmer records from database...</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="p-8 text-center bg-rose-50/50">
          <p className="text-sm font-semibold text-rose-800">{error}</p>
          <p className="text-xs text-rose-600 mt-1">Please ensure the backend API bridge is active.</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-sm transition-all"
            >
              Retry Connection
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredAndSortedFarmers.length === 0 && (
        <div className="p-12 text-center">
          <Filter className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-700">No matching farmer records found</h4>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search query or filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-3 px-3 py-1.5 text-xs font-medium text-forest-700 bg-forest-50 hover:bg-forest-100 rounded-xl transition-all"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Table & Mobile Card View Content */}
      {!isLoading && !error && filteredAndSortedFarmers.length > 0 && (
        <>
          {/* Mobile Card View (visible on small and medium screens < md) */}
          <div className="block md:hidden divide-y divide-slate-100 p-2 sm:p-3 space-y-3">
            {filteredAndSortedFarmers.map((farmer) => {
              const isPaid = farmer.payment_status === 'PAID';
              return (
                <div
                  key={farmer.id}
                  onClick={() => onSelectFarmer(farmer)}
                  className="bg-cream-50/50 hover:bg-cream-50 border border-slate-200/80 rounded-2xl p-4 transition-all shadow-subtle cursor-pointer active:scale-[0.99]"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-lg border border-forest-200">
                          #{farmer.id}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{farmer.name}</h4>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {farmer.village} Division
                      </p>
                    </div>

                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] shrink-0 ${
                        isPaid
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}
                    >
                      {isPaid ? (
                        <>
                          <CheckCircle2 className="w-3 h-3" />
                          Paid
                        </>
                      ) : (
                        <>
                          <Clock className="w-3 h-3" />
                          Pending
                        </>
                      )}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 my-3 p-2.5 bg-white rounded-xl border border-slate-100 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium uppercase">Cane</span>
                      <p className="font-bold text-slate-900 text-xs sm:text-sm mt-0.5">
                        {formatTonnes(farmer.sugarcane_supplied_tonnes)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium uppercase">Paid</span>
                      <p className="font-bold text-emerald-700 text-xs sm:text-sm mt-0.5">
                        {formatCurrency(farmer.amount_paid)}
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 font-medium uppercase">Pending</span>
                      <p className="font-bold text-amber-700 text-xs sm:text-sm mt-0.5">
                        {formatCurrency(farmer.payment_pending_amount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onSelectFarmer(farmer)}
                      className="px-3 py-1.5 text-slate-700 hover:text-slate-900 bg-white border border-slate-200 rounded-xl font-medium flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Details</span>
                    </button>
                    <button
                      onClick={() => onAskAIAboutFarmer(farmer.name)}
                      className="px-3 py-1.5 text-forest-800 hover:text-forest-950 bg-forest-50 hover:bg-forest-100 border border-forest-200 rounded-xl font-medium flex items-center gap-1.5 transition-all shadow-2xs"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-forest-600" />
                      <span>Ask AI</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Data Table (visible on md screens and up) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th
                    onClick={() => handleSort('id')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group w-16"
                  >
                    ID {renderSortIcon('id')}
                  </th>
                  <th
                    onClick={() => handleSort('name')}
                    className="py-3 px-4 cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    Farmer Name {renderSortIcon('name')}
                  </th>
                  <th className="py-3 px-4">Village</th>
                  <th
                    onClick={() => handleSort('sugarcane_supplied_tonnes')}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    Sugarcane Supplied (T) {renderSortIcon('sugarcane_supplied_tonnes')}
                  </th>
                  <th
                    onClick={() => handleSort('amount_paid')}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    Amount Paid (₹) {renderSortIcon('amount_paid')}
                  </th>
                  <th
                    onClick={() => handleSort('payment_pending_amount')}
                    className="py-3 px-4 text-right cursor-pointer hover:bg-slate-100 transition-colors group"
                  >
                    Pending Payment (₹) {renderSortIcon('payment_pending_amount')}
                  </th>
                  <th className="py-3 px-4 text-center">Payment Status</th>
                  <th className="py-3 px-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedFarmers.map((farmer) => {
                  const isPaid = farmer.payment_status === 'PAID';
                  return (
                    <tr
                      key={farmer.id}
                      onClick={() => onSelectFarmer(farmer)}
                      className="hover:bg-cream-50/70 transition-colors cursor-pointer group"
                    >
                      <td className="py-3 px-4 font-mono font-medium text-slate-400 group-hover:text-forest-800">
                        #{farmer.id}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <span>{farmer.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          {farmer.village}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-medium text-slate-800">
                        {formatTonnes(farmer.sugarcane_supplied_tonnes)}
                      </td>
                      <td className="py-3 px-4 text-right font-semibold text-emerald-700">
                        {formatCurrency(farmer.amount_paid)}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-amber-700">
                        {formatCurrency(farmer.payment_pending_amount)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isPaid ? (
                            <>
                              <CheckCircle2 className="w-3 h-3" />
                              Fully Paid
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Pending Payment
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => onSelectFarmer(farmer)}
                            className="p-1.5 text-slate-500 hover:text-forest-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View farmer details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onAskAIAboutFarmer(farmer.name)}
                            className="p-1.5 text-forest-700 hover:text-forest-900 hover:bg-forest-50 rounded-lg transition-colors"
                            title={`Ask AI about ${farmer.name}`}
                          >
                            <Sparkles className="w-4 h-4 text-forest-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Summary Footer bar showing totals of currently displayed records */}
      {!isLoading && !error && filteredAndSortedFarmers.length > 0 && (
        <div className="p-4 bg-slate-50/80 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            Showing <span className="font-bold text-slate-900">{filteredAndSortedFarmers.length}</span> of{' '}
            <span className="font-bold text-slate-900">{farmers.length}</span> farmer records
          </div>
          <div className="flex flex-wrap items-center gap-4 text-xs">
            <div>
              Total Cane: <span className="font-bold text-slate-900">
                {formatTonnes(filteredAndSortedFarmers.reduce((sum, f) => sum + f.sugarcane_supplied_tonnes, 0))}
              </span>
            </div>
            <div>
              Total Paid: <span className="font-bold text-emerald-700">
                {formatCurrency(filteredAndSortedFarmers.reduce((sum, f) => sum + f.amount_paid, 0))}
              </span>
            </div>
            <div>
              Total Pending: <span className="font-bold text-amber-700">
                {formatCurrency(filteredAndSortedFarmers.reduce((sum, f) => sum + f.payment_pending_amount, 0))}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
