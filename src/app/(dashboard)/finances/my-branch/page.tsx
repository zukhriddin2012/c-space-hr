'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  RefreshCw,
  Building2,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react';

interface Transaction {
  id: string;
  branch_id: string;
  branch_name?: string;
  transaction_type: 'revenue' | 'expense';
  transaction_date: string;
  amount: number;
  service_type?: string;
  customer_name?: string;
  expense_category?: string;
  vendor_name?: string;
  payment_method?: string;
  notes?: string;
  approval_status: 'approved' | 'pending' | 'rejected';
}

interface Branch {
  id: string;
  name: string;
}

const PaymentBadge = ({ method }: { method: string }) => {
  const config: Record<string, { bg: string; text: string; icon: string }> = {
    cash: { bg: 'bg-green-50', text: 'text-green-700', icon: '💵' },
    terminal: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '💳' },
    payme: { bg: 'bg-cyan-50', text: 'text-cyan-700', icon: '💳' },
    click: { bg: 'bg-blue-50', text: 'text-blue-700', icon: '📱' },
    uzum: { bg: 'bg-yellow-50', text: 'text-yellow-700', icon: '📱' },
    bank: { bg: 'bg-purple-50', text: 'text-purple-700', icon: '🏦' },
  };
  const c = config[method] || { bg: 'bg-gray-50', text: 'text-gray-700', icon: '💳' };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 ${c.bg} ${c.text} rounded text-xs`}>
      {c.icon} {method.charAt(0).toUpperCase() + method.slice(1)}
    </span>
  );
};

const CategoryBadge = ({ category }: { category: string }) => {
  const colors: Record<string, string> = {
    Office: 'bg-blue-100 text-blue-700',
    Dedicated: 'bg-indigo-100 text-indigo-700',
    Flex: 'bg-violet-100 text-violet-700',
    Meeting: 'bg-purple-100 text-purple-700',
    Conference: 'bg-fuchsia-100 text-fuchsia-700',
    Hour: 'bg-pink-100 text-pink-700',
    'Day Pass': 'bg-rose-100 text-rose-700',
    Goods: 'bg-amber-100 text-amber-700',
    Utility: 'bg-orange-100 text-orange-700',
    Maintenance: 'bg-yellow-100 text-yellow-700',
    Staff: 'bg-lime-100 text-lime-700',
    Marketing: 'bg-teal-100 text-teal-700',
    Tax: 'bg-red-100 text-red-700',
    CapEx: 'bg-slate-100 text-slate-700',
    Other: 'bg-gray-100 text-gray-700',
  };

  return (
    <span className={`inline-block px-2 py-0.5 rounded text-xs ${colors[category] || 'bg-gray-100 text-gray-700'}`}>
      {category}
    </span>
  );
};

function formatCurrency(amount: number): string {
  return amount.toLocaleString('uz-UZ');
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyBranchFinancesPage() {
  const [loading, setLoading] = useState(true);
  const [userBranch, setUserBranch] = useState<Branch | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showTypeFilter, setShowTypeFilter] = useState(false);

  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch user's branch
  useEffect(() => {
    const fetchUserBranch = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const user = await res.json();
          if (user.branchId) {
            // Fetch branch details
            const branchRes = await fetch(`/api/branches/${user.branchId}`);
            if (branchRes.ok) {
              const data = await branchRes.json();
              setUserBranch(data.branch);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user branch:', error);
      }
    };
    fetchUserBranch();
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!userBranch?.id) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        branchId: userBranch.id,
        startDate: dateFrom,
        endDate: dateTo,
        limit: '200',
      });
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/finances/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const txns = (data.transactions || []).map((t: Transaction) => ({
          ...t,
          branch_name: userBranch.name,
        }));
        setTransactions(txns);
        setTotalCount(data.total || 0);
        setTotalRevenue(data.totalRevenue || 0);
        setTotalExpenses(data.totalExpenses || 0);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [userBranch, dateFrom, dateTo, typeFilter, searchQuery]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Service/Category', 'Customer/Vendor', 'Payment', 'Amount', 'Status', 'Notes'];
    const rows = transactions.map((t) => [
      t.transaction_date,
      t.transaction_type,
      t.service_type || t.expense_category || '',
      t.customer_name || t.vendor_name || '',
      t.payment_method || '',
      t.amount.toString(),
      t.approval_status,
      t.notes || '',
    ]);

    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-branch-transactions-${dateFrom}-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const netAmount = totalRevenue - totalExpenses;
  const pendingCount = transactions.filter((t) => t.approval_status === 'pending').length;
  const approvedCount = transactions.filter((t) => t.approval_status === 'approved').length;

  if (!userBranch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading your branch data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/finances"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">{userBranch.name}</h1>
                <p className="text-emerald-100">Branch Financial Overview</p>
              </div>
            </div>

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-100 text-sm">Total Revenue</span>
                <TrendingUp className="w-5 h-5 text-emerald-200" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              <p className="text-emerald-200 text-xs mt-1">UZS</p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-100 text-sm">Total Expenses</span>
                <TrendingDown className="w-5 h-5 text-red-300" />
              </div>
              <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
              <p className="text-emerald-200 text-xs mt-1">UZS</p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-100 text-sm">Net Profit</span>
                <DollarSign className="w-5 h-5 text-emerald-200" />
              </div>
              <p className={`text-2xl font-bold ${netAmount < 0 ? 'text-red-300' : ''}`}>
                {formatCurrency(netAmount)}
              </p>
              <p className="text-emerald-200 text-xs mt-1">UZS</p>
            </div>

            <div className="bg-white/10 backdrop-blur rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-emerald-100 text-sm">Transactions</span>
                <Wallet className="w-5 h-5 text-emerald-200" />
              </div>
              <p className="text-2xl font-bold">{totalCount}</p>
              <p className="text-emerald-200 text-xs mt-1">
                {approvedCount} approved • {pendingCount} pending
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search transactions..."
                className="w-64 pl-9 pr-3 py-2 bg-gray-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-colors"
              />
            </div>

            {/* Type Filter */}
            <div className="relative">
              <button
                onClick={() => setShowTypeFilter(!showTypeFilter)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg text-sm transition-colors"
              >
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">
                  {typeFilter === 'all' ? 'All Types' : typeFilter === 'revenue' ? 'Revenue' : 'Expenses'}
                </span>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>

              {showTypeFilter && (
                <>
                  <div className="fixed inset-0 z-20" onClick={() => setShowTypeFilter(false)} />
                  <div className="absolute top-full mt-2 left-0 bg-white rounded-xl shadow-lg border py-2 min-w-[150px] z-30">
                    {['all', 'revenue', 'expense'].map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setTypeFilter(type as typeof typeFilter);
                          setShowTypeFilter(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                          typeFilter === type ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-gray-700'
                        }`}
                      >
                        {type === 'all' ? 'All Types' : type === 'revenue' ? 'Revenue' : 'Expenses'}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Date Range */}
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1.5">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent border-0 text-sm text-gray-700 focus:ring-0 w-32"
            />
            <span className="text-gray-400">→</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent border-0 text-sm text-gray-700 focus:ring-0 w-32"
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Wallet className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions found</h3>
              <p className="text-sm text-gray-500">Try adjusting your filters or date range</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Type</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Service/Category</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Customer/Vendor</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Payment</th>
                    <th className="px-4 py-3 text-right font-medium text-gray-600">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Status</th>
                    <th className="px-4 py-3 text-left font-medium text-gray-600">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((txn) => (
                    <tr key={txn.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(txn.transaction_date)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            txn.transaction_type === 'revenue'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {txn.transaction_type === 'revenue' ? (
                            <ArrowUpRight className="w-3 h-3" />
                          ) : (
                            <ArrowDownRight className="w-3 h-3" />
                          )}
                          {txn.transaction_type === 'revenue' ? 'Revenue' : 'Expense'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {txn.service_type || txn.expense_category ? (
                          <CategoryBadge category={txn.service_type || txn.expense_category || ''} />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-900">
                        {txn.customer_name || txn.vendor_name || <span className="text-gray-400">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        {txn.payment_method ? (
                          <PaymentBadge method={txn.payment_method} />
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-semibold tabular-nums ${
                            txn.transaction_type === 'revenue' ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {txn.transaction_type === 'expense' ? '-' : ''}
                          {formatCurrency(txn.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${
                            txn.approval_status === 'approved'
                              ? 'bg-green-100 text-green-700'
                              : txn.approval_status === 'pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}
                        >
                          {txn.approval_status === 'approved' && <Check className="w-3 h-3" />}
                          {txn.approval_status.charAt(0).toUpperCase() + txn.approval_status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate">
                        {txn.notes || <span className="text-gray-400">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-600 flex justify-between items-center">
            <span>{totalCount} transactions shown</span>
            <div className="flex items-center gap-4">
              <span>
                Revenue: <strong className="text-green-600">{formatCurrency(totalRevenue)} UZS</strong>
              </span>
              <span>
                Expenses: <strong className="text-red-600">{formatCurrency(totalExpenses)} UZS</strong>
              </span>
              <span>
                Net: <strong className={netAmount >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                  {formatCurrency(netAmount)} UZS
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
