'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertCircle,
  Upload,
  Plus,
  Filter,
  Download,
  RefreshCw,
  Building2,
  Briefcase,
  Users,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
} from 'lucide-react';
import Link from 'next/link';

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  transactionCount: number;
  revenueByService: Record<string, number>;
  revenueByPaymentMethod: Record<string, number>;
  pendingApprovals: number;
  outstandingDebt: number;
}

interface Transaction {
  id: string;
  transaction_type: 'revenue' | 'expense';
  transaction_date: string;
  amount: number;
  service_type?: string;
  customer_name?: string;
  expense_category?: string;
  vendor_name?: string;
  payment_method?: string;
  notes?: string;
}

interface Branch {
  id: string;
  name: string;
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

// Service type colors
const SERVICE_COLORS: Record<string, string> = {
  Office: 'bg-blue-500',
  Dedicated: 'bg-purple-500',
  Flex: 'bg-green-500',
  Meeting: 'bg-yellow-500',
  Conference: 'bg-orange-500',
  Hour: 'bg-pink-500',
  'Day Pass': 'bg-cyan-500',
  Other: 'bg-gray-500',
};

export default function BranchFinancesPage() {
  const params = useParams();
  const branchId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [branch, setBranch] = useState<Branch | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [period, setPeriod] = useState<{ startDate: string; endDate: string } | null>(null);

  // Import modal
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<'revenue' | 'expense'>('revenue');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    success: boolean;
    imported?: number;
    errors?: number;
    message?: string;
  } | null>(null);

  // New transaction modal
  const [showNewTransaction, setShowNewTransaction] = useState(false);
  const [newTxn, setNewTxn] = useState({
    transaction_type: 'revenue' as 'revenue' | 'expense',
    transaction_date: new Date().toISOString().split('T')[0],
    amount: '',
    service_type: 'Meeting',
    customer_name: '',
    expense_category: 'Goods',
    vendor_name: '',
    payment_method: 'cash',
    notes: '',
  });
  const [savingTxn, setSavingTxn] = useState(false);

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

      // Fetch dashboard stats
      const statsRes = await fetch(`/api/finances/dashboard?branchId=${branchId}`);
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData.stats);
        setPeriod(statsData.period);
      }

      // Fetch recent transactions
      const txnRes = await fetch(`/api/finances/transactions?branchId=${branchId}&limit=20`);
      if (txnRes.ok) {
        const txnData = await txnRes.json();
        setTransactions(txnData.transactions || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle file import
  const handleImport = async () => {
    if (!importFile) return;

    setImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append('file', importFile);
    formData.append('branchId', branchId);
    formData.append('importType', importType);

    try {
      const res = await fetch('/api/finances/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setImportResult({
          success: true,
          imported: data.imported,
          errors: data.errors,
        });
        // Refresh data
        fetchData();
      } else {
        setImportResult({
          success: false,
          message: data.error || 'Import failed',
        });
      }
    } catch (error) {
      setImportResult({
        success: false,
        message: 'Import failed',
      });
    } finally {
      setImporting(false);
    }
  };

  // Handle new transaction
  const handleNewTransaction = async () => {
    setSavingTxn(true);

    try {
      const res = await fetch('/api/finances/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branch_id: branchId,
          ...newTxn,
          amount: parseFloat(newTxn.amount) || 0,
        }),
      });

      if (res.ok) {
        setShowNewTransaction(false);
        setNewTxn({
          transaction_type: 'revenue',
          transaction_date: new Date().toISOString().split('T')[0],
          amount: '',
          service_type: 'Meeting',
          customer_name: '',
          expense_category: 'Goods',
          vendor_name: '',
          payment_method: 'cash',
          notes: '',
        });
        fetchData();
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
    } finally {
      setSavingTxn(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/branches"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {branch?.name || 'Branch'} - Finances
            </h1>
            {period && (
              <p className="text-sm text-gray-500">
                {new Date(period.startDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import Excel
          </button>
          <button
            onClick={() => setShowNewTransaction(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Transaction
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Revenue</span>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className="w-4 h-4 text-green-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(stats?.totalRevenue || 0)}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            {stats?.transactionCount || 0} transactions
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Expenses</span>
            <div className="p-2 bg-red-100 rounded-lg">
              <TrendingDown className="w-4 h-4 text-red-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(stats?.totalExpenses || 0)}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Net Profit</span>
            <div className="p-2 bg-blue-100 rounded-lg">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(stats?.netProfit || 0)}
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Outstanding Debt</span>
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertCircle className="w-4 h-4 text-amber-600" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600">
            {formatCurrency(stats?.outstandingDebt || 0)}
          </div>
          {(stats?.pendingApprovals || 0) > 0 && (
            <div className="text-xs text-amber-500 mt-1">
              {stats?.pendingApprovals} pending approvals
            </div>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Revenue by Service */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Revenue by Service</h3>
          <div className="space-y-3">
            {stats?.revenueByService && Object.entries(stats.revenueByService)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 6)
              .map(([service, amount]) => {
                const percentage = stats.totalRevenue > 0
                  ? (amount / stats.totalRevenue) * 100
                  : 0;
                return (
                  <div key={service}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">{service}</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${SERVICE_COLORS[service] || 'bg-gray-500'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Revenue by Payment Method */}
        <div className="bg-white rounded-xl p-6 shadow-sm border">
          <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {stats?.revenueByPaymentMethod && Object.entries(stats.revenueByPaymentMethod)
              .sort(([, a], [, b]) => b - a)
              .map(([method, amount]) => {
                const percentage = stats.totalRevenue > 0
                  ? (amount / stats.totalRevenue) * 100
                  : 0;
                return (
                  <div key={method} className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {PAYMENT_ICONS[method] || <DollarSign className="w-4 h-4" />}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 capitalize">{method}</span>
                        <span className="font-medium">{formatCurrency(amount)}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 w-12 text-right">
                      {percentage.toFixed(0)}%
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Recent Transactions</h3>
          <Link
            href={`/branches/${branchId}/finances/transactions`}
            className="text-sm text-blue-500 hover:text-blue-600"
          >
            View All →
          </Link>
        </div>
        <div className="divide-y">
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No transactions yet</p>
              <p className="text-sm mt-1">Import Excel or add a transaction to get started</p>
            </div>
          ) : (
            transactions.map((txn) => (
              <div key={txn.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${
                    txn.transaction_type === 'revenue' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {txn.transaction_type === 'revenue' ? (
                      <TrendingUp className={`w-4 h-4 text-green-600`} />
                    ) : (
                      <TrendingDown className={`w-4 h-4 text-red-600`} />
                    )}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {txn.service_type || txn.expense_category || 'Transaction'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {txn.customer_name || txn.vendor_name || '—'} •{' '}
                      <span className="capitalize">{txn.payment_method}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`font-semibold ${
                    txn.transaction_type === 'revenue' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {txn.transaction_type === 'revenue' ? '+' : '-'}
                    {formatFullCurrency(txn.amount)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(txn.transaction_date).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Import Excel Data</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Import Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setImportType('revenue')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    importType === 'revenue'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  Revenue / Sales
                </button>
                <button
                  onClick={() => setImportType('expense')}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    importType === 'expense'
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  Expenses / Costs
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excel File
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {importFile ? (
                    <div>
                      <div className="font-medium text-gray-900">{importFile.name}</div>
                      <div className="text-sm text-gray-500">Click to change file</div>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <div className="text-sm text-gray-500">
                        Click to select or drag and drop
                      </div>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {importResult && (
              <div className={`mb-4 p-3 rounded-lg ${
                importResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {importResult.success ? (
                  <div>
                    ✓ Imported {importResult.imported} transactions
                    {importResult.errors ? ` (${importResult.errors} errors)` : ''}
                  </div>
                ) : (
                  <div>✗ {importResult.message}</div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                  setImportResult(null);
                }}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={!importFile || importing}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Transaction Modal */}
      {showNewTransaction && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <h2 className="text-xl font-bold mb-4">New Transaction</h2>

            <div className="space-y-4">
              {/* Type Toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setNewTxn({ ...newTxn, transaction_type: 'revenue' })}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    newTxn.transaction_type === 'revenue'
                      ? 'bg-green-50 border-green-500 text-green-700'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  + Revenue
                </button>
                <button
                  onClick={() => setNewTxn({ ...newTxn, transaction_type: 'expense' })}
                  className={`flex-1 py-2 px-4 rounded-lg border ${
                    newTxn.transaction_type === 'expense'
                      ? 'bg-red-50 border-red-500 text-red-700'
                      : 'bg-white border-gray-300'
                  }`}
                >
                  - Expense
                </button>
              </div>

              {/* Service/Category Selection */}
              {newTxn.transaction_type === 'revenue' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Office', 'Dedicated', 'Flex', 'Meeting', 'Conference', 'Hour'].map((service) => (
                      <button
                        key={service}
                        onClick={() => setNewTxn({ ...newTxn, service_type: service })}
                        className={`py-2 px-3 rounded-lg border text-sm ${
                          newTxn.service_type === service
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'bg-white border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    value={newTxn.expense_category}
                    onChange={(e) => setNewTxn({ ...newTxn, expense_category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="Goods">Goods & Supplies</option>
                    <option value="Utility">Utilities</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Staff">Staff</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount (UZS)
                </label>
                <input
                  type="text"
                  value={newTxn.amount}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, '');
                    setNewTxn({ ...newTxn, amount: value });
                  }}
                  placeholder="150000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-lg font-mono"
                />
              </div>

              {/* Customer/Vendor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {newTxn.transaction_type === 'revenue' ? 'Customer Name' : 'Vendor'}
                </label>
                <input
                  type="text"
                  value={newTxn.transaction_type === 'revenue' ? newTxn.customer_name : newTxn.vendor_name}
                  onChange={(e) =>
                    setNewTxn({
                      ...newTxn,
                      [newTxn.transaction_type === 'revenue' ? 'customer_name' : 'vendor_name']: e.target.value,
                    })
                  }
                  placeholder={newTxn.transaction_type === 'revenue' ? 'Oybek Dadashev' : 'Supplier name'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <div className="flex gap-2 flex-wrap">
                  {['cash', 'terminal', 'payme', 'click', 'uzum', 'bank'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setNewTxn({ ...newTxn, payment_method: method })}
                      className={`flex items-center gap-2 py-2 px-3 rounded-lg border ${
                        newTxn.payment_method === method
                          ? 'bg-blue-50 border-blue-500 text-blue-700'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {PAYMENT_ICONS[method]}
                      <span className="capitalize text-sm">{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  value={newTxn.transaction_date}
                  onChange={(e) => setNewTxn({ ...newTxn, transaction_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowNewTransaction(false)}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleNewTransaction}
                disabled={!newTxn.amount || savingTxn}
                className="flex-1 py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {savingTxn ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
