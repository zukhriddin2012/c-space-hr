'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Filter,
  Download,
  RefreshCw,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Calendar,
  Building2,
  Briefcase,
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle,
  Clock,
  XCircle,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';
import Link from 'next/link';

interface Transaction {
  id: string;
  branch_id: string;
  transaction_type: 'revenue' | 'expense';
  transaction_date: string;
  amount: number;
  service_type?: string;
  customer_name?: string;
  customer_id?: string;
  expense_category?: string;
  vendor_name?: string;
  payment_method?: string;
  notes?: string;
  receipt_number?: string;
  invoice_number?: string;
  approval_status: 'approved' | 'pending' | 'rejected';
  created_at: string;
  import_batch_id?: string;
}

interface Branch {
  id: string;
  name: string;
}

interface FilterState {
  search: string;
  transactionType: 'all' | 'revenue' | 'expense';
  startDate: string;
  endDate: string;
  serviceType: string;
  expenseCategory: string;
  paymentMethod: string;
  approvalStatus: string;
}

// Format currency in UZS
function formatCurrency(amount: number): string {
  if (amount >= 1000000000) {
    return `${(amount / 1000000000).toFixed(1)}B`;
  }
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(0)}K`;
  }
  return amount.toLocaleString();
}

// Full format
function formatFullCurrency(amount: number): string {
  return amount.toLocaleString('uz-UZ') + ' UZS';
}

// Payment method icons
const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  cash: <Banknote className="w-4 h-4" />,
  bank: <Building2 className="w-4 h-4" />,
  payme: <Smartphone className="w-4 h-4 text-cyan-500" />,
  click: <Smartphone className="w-4 h-4 text-blue-500" />,
  uzum: <Smartphone className="w-4 h-4 text-purple-500" />,
  terminal: <CreditCard className="w-4 h-4" />,
};

// Service types
const SERVICE_TYPES = ['Office', 'Dedicated', 'Flex', 'Meeting', 'Conference', 'Hour', 'Day Pass', 'Other'];

// Expense categories
const EXPENSE_CATEGORIES = ['Goods', 'Utility', 'Maintenance', 'Staff', 'Marketing', 'Tax', 'CapEx', 'Other'];

// Payment methods
const PAYMENT_METHODS = ['cash', 'terminal', 'payme', 'click', 'uzum', 'bank'];

// Approval status
const APPROVAL_STATUSES = ['approved', 'pending', 'rejected'];

// Status badge component
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ReactNode; bg: string; text: string }> = {
    approved: { icon: <CheckCircle className="w-3 h-3" />, bg: 'bg-green-100', text: 'text-green-700' },
    pending: { icon: <Clock className="w-3 h-3" />, bg: 'bg-yellow-100', text: 'text-yellow-700' },
    rejected: { icon: <XCircle className="w-3 h-3" />, bg: 'bg-red-100', text: 'text-red-700' },
  };

  const { icon, bg, text } = config[status] || config.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
      {icon}
      <span className="capitalize">{status}</span>
    </span>
  );
}

export default function TransactionsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(25);

  // Stats
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    transactionType: 'all',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    serviceType: '',
    expenseCategory: '',
    paymentMethod: '',
    approvalStatus: '',
  });
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Context menu
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  // Calculate active filters
  useEffect(() => {
    let count = 0;
    if (filters.transactionType !== 'all') count++;
    if (filters.serviceType) count++;
    if (filters.expenseCategory) count++;
    if (filters.paymentMethod) count++;
    if (filters.approvalStatus) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch branch info
      const branchRes = await fetch(`/api/branches/${branchId}`);
      if (branchRes.ok) {
        const branchData = await branchRes.json();
        setBranch(branchData.branch);
      }

      // Build query params
      const queryParams = new URLSearchParams({
        branchId,
        limit: pageSize.toString(),
        offset: ((page - 1) * pageSize).toString(),
      });

      if (filters.startDate) queryParams.set('startDate', filters.startDate);
      if (filters.endDate) queryParams.set('endDate', filters.endDate);
      if (filters.transactionType !== 'all') queryParams.set('type', filters.transactionType);
      if (filters.serviceType) queryParams.set('serviceType', filters.serviceType);
      if (filters.expenseCategory) queryParams.set('expenseCategory', filters.expenseCategory);
      if (filters.paymentMethod) queryParams.set('paymentMethod', filters.paymentMethod);
      if (filters.approvalStatus) queryParams.set('approvalStatus', filters.approvalStatus);
      if (filters.search) queryParams.set('search', filters.search);

      // Fetch transactions
      const txnRes = await fetch(`/api/finances/transactions?${queryParams.toString()}`);
      if (txnRes.ok) {
        const txnData = await txnRes.json();
        setTransactions(txnData.transactions || []);
        setTotalCount(txnData.total || 0);
        setTotalRevenue(txnData.totalRevenue || 0);
        setTotalExpenses(txnData.totalExpenses || 0);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [branchId, page, pageSize, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Close context menu on click outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [filters]);

  // Handle export
  const handleExport = async () => {
    // Build the same query params for export
    const queryParams = new URLSearchParams({
      branchId,
      export: 'true',
    });

    if (filters.startDate) queryParams.set('startDate', filters.startDate);
    if (filters.endDate) queryParams.set('endDate', filters.endDate);
    if (filters.transactionType !== 'all') queryParams.set('type', filters.transactionType);
    if (filters.serviceType) queryParams.set('serviceType', filters.serviceType);
    if (filters.paymentMethod) queryParams.set('paymentMethod', filters.paymentMethod);

    // For now, download as CSV from the filtered data
    const headers = ['Date', 'Type', 'Service/Category', 'Customer/Vendor', 'Payment Method', 'Amount', 'Status'];
    const rows = transactions.map(txn => [
      txn.transaction_date,
      txn.transaction_type,
      txn.service_type || txn.expense_category || '',
      txn.customer_name || txn.vendor_name || '',
      txn.payment_method || '',
      txn.amount.toString(),
      txn.approval_status,
    ]);

    const csv = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transactions-${branchId}-${filters.startDate}-${filters.endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      transactionType: 'all',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      serviceType: '',
      expenseCategory: '',
      paymentMethod: '',
      approvalStatus: '',
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href={`/branches/${branchId}/finances`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Transactions
            </h1>
            <p className="text-sm text-gray-500">
              {branch?.name} • {formatCurrency(totalCount)} records
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              showFilters ? 'bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className={`px-1.5 py-0.5 text-xs rounded-full ${
                showFilters ? 'bg-white text-blue-500' : 'bg-blue-500 text-white'
              }`}>
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Revenue</p>
              <p className="text-xl font-bold text-green-600">+{formatCurrency(totalRevenue)}</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Expenses</p>
              <p className="text-xl font-bold text-red-600">-{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Net Balance</p>
              <p className={`text-xl font-bold ${totalRevenue - totalExpenses >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {totalRevenue - totalExpenses >= 0 ? '+' : ''}{formatCurrency(totalRevenue - totalExpenses)}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white rounded-xl p-4 shadow-sm border mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Filters</h3>
            <button
              onClick={clearFilters}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Clear all
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              />
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={filters.transactionType}
                onChange={(e) => setFilters({ ...filters, transactionType: e.target.value as FilterState['transactionType'] })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="all">All Types</option>
                <option value="revenue">Revenue</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => setFilters({ ...filters, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Methods</option>
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method} className="capitalize">{method}</option>
                ))}
              </select>
            </div>

            {/* Service Type (for revenue) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
              <select
                value={filters.serviceType}
                onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Services</option>
                {SERVICE_TYPES.map((service) => (
                  <option key={service} value={service}>{service}</option>
                ))}
              </select>
            </div>

            {/* Expense Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expense Category</label>
              <select
                value={filters.expenseCategory}
                onChange={(e) => setFilters({ ...filters, expenseCategory: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Categories</option>
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Approval Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
              <select
                value={filters.approvalStatus}
                onChange={(e) => setFilters({ ...filters, approvalStatus: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
              >
                <option value="">All Statuses</option>
                {APPROVAL_STATUSES.map((status) => (
                  <option key={status} value={status} className="capitalize">{status}</option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Customer, vendor, notes..."
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No transactions found</p>
            <p className="text-sm mt-1">Try adjusting your filters or date range</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service / Category
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer / Vendor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(txn.transaction_date).toLocaleDateString('en-US', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(txn.transaction_date).getFullYear()}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium ${
                          txn.transaction_type === 'revenue'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {txn.transaction_type === 'revenue' ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                          <span className="capitalize">{txn.transaction_type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {txn.service_type || txn.expense_category || '—'}
                        </div>
                        {txn.notes && (
                          <div className="text-xs text-gray-400 truncate max-w-[200px]">
                            {txn.notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-gray-900">
                          {txn.customer_name || txn.vendor_name || '—'}
                        </div>
                        {txn.receipt_number && (
                          <div className="text-xs text-gray-400">
                            #{txn.receipt_number}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-gray-100 rounded">
                            {PAYMENT_ICONS[txn.payment_method || 'cash'] || <DollarSign className="w-3 h-3" />}
                          </div>
                          <span className="text-sm text-gray-600 capitalize">
                            {txn.payment_method || '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className={`text-sm font-semibold ${
                          txn.transaction_type === 'revenue' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {txn.transaction_type === 'revenue' ? '+' : '-'}
                          {formatFullCurrency(txn.amount)}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <StatusBadge status={txn.approval_status} />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setContextMenu({
                              id: txn.id,
                              x: e.clientX,
                              y: e.clientY,
                            });
                          }}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-gray-400" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {((page - 1) * pageSize) + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} transactions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          page === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'hover:bg-gray-200'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="p-2 hover:bg-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-white rounded-lg shadow-lg border py-1 z-50 min-w-[150px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              // TODO: Implement view details
              setContextMenu(null);
            }}
          >
            <Eye className="w-4 h-4" />
            View Details
          </button>
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
            onClick={() => {
              // TODO: Implement edit
              setContextMenu(null);
            }}
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
          <div className="border-t my-1" />
          <button
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2 text-red-600"
            onClick={() => {
              // TODO: Implement delete
              setContextMenu(null);
            }}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
