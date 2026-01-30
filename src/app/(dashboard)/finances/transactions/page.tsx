'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  RefreshCw,
  Download,
  Search,
  Filter,
  ChevronDown,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  X,
  MoreHorizontal,
  GripVertical,
  Wallet,
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
  isNew?: boolean;
  isDirty?: boolean;
  isProcessed?: boolean;
}

interface Branch {
  id: string;
  name: string;
}

type EditingCell = {
  rowId: string;
  field: string;
} | null;

const SERVICE_TYPES = ['Office', 'Dedicated', 'Flex', 'Meeting', 'Conference', 'Hour', 'Day Pass', 'Other'];
const EXPENSE_CATEGORIES = ['Goods', 'Utility', 'Maintenance', 'Staff', 'Marketing', 'Tax', 'CapEx', 'Other'];
const PAYMENT_METHODS = ['cash', 'terminal', 'payme', 'click', 'uzum', 'bank'];

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

const CategoryBadge = ({ category, type }: { category: string; type: 'revenue' | 'expense' }) => {
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

const AvatarBadge = ({ name }: { name: string }) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const colors = [
    'from-purple-400 to-pink-400',
    'from-blue-400 to-cyan-400',
    'from-green-400 to-teal-400',
    'from-yellow-400 to-orange-400',
    'from-red-400 to-pink-400',
    'from-indigo-400 to-purple-400',
  ];
  const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;

  return (
    <div className={`w-6 h-6 bg-gradient-to-br ${colors[colorIndex]} rounded-full flex items-center justify-center text-white text-xs font-medium`}>
      {initial}
    </div>
  );
};

function formatCurrency(amount: number): string {
  return amount.toLocaleString('uz-UZ');
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Inline editable cell component
function InlineCell({
  value,
  displayValue,
  isEditing,
  onStartEdit,
  onChange,
  onFinishEdit,
  type = 'text',
  options,
  placeholder,
  className = '',
  align = 'left',
}: {
  value: string | number;
  displayValue?: React.ReactNode;
  isEditing: boolean;
  onStartEdit: () => void;
  onChange: (value: string) => void;
  onFinishEdit: () => void;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  placeholder?: string;
  className?: string;
  align?: 'left' | 'right';
}) {
  const inputRef = useRef<HTMLInputElement | HTMLSelectElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      if (inputRef.current instanceof HTMLInputElement) {
        inputRef.current.select();
      }
    }
  }, [isEditing]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      onFinishEdit();
    }
    if (e.key === 'Escape') {
      onFinishEdit();
    }
  };

  if (isEditing) {
    if (type === 'select' && options) {
      return (
        <select
          ref={inputRef as React.RefObject<HTMLSelectElement>}
          value={String(value)}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onFinishEdit}
          onKeyDown={handleKeyDown}
          className={`w-full h-8 px-2 text-sm border border-purple-400 rounded bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none ${className}`}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt.charAt(0).toUpperCase() + opt.slice(1)}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        ref={inputRef as React.RefObject<HTMLInputElement>}
        type={type}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onFinishEdit}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={`w-full h-8 px-2 text-sm border border-purple-400 rounded bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none ${
          align === 'right' ? 'text-right' : ''
        } ${className}`}
      />
    );
  }

  return (
    <div
      onClick={onStartEdit}
      className={`min-h-[32px] px-2 py-1.5 cursor-text rounded hover:bg-purple-50 transition-colors flex items-center ${
        align === 'right' ? 'justify-end' : ''
      } ${className}`}
    >
      {displayValue !== undefined ? displayValue : (
        <span className={!value ? 'text-gray-400' : ''}>
          {value || placeholder || '—'}
        </span>
      )}
    </div>
  );
}

export default function TransactionsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);
  const [editingCell, setEditingCell] = useState<EditingCell>(null);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showProcessModal, setShowProcessModal] = useState(false);

  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/branches');
        if (res.ok) {
          const data = await res.json();
          setBranches(data.branches || []);
          if (data.branches?.length > 0) {
            setSelectedBranch(data.branches[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
      }
    };
    fetchBranches();
  }, []);

  const fetchTransactions = useCallback(async () => {
    if (!selectedBranch) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        branchId: selectedBranch,
        startDate: dateFrom,
        endDate: dateTo,
        limit: '500',
      });
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/finances/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const branchName = branches.find((b) => b.id === selectedBranch)?.name || '';
        const txns = (data.transactions || []).map((t: Transaction) => ({
          ...t,
          branch_name: branchName,
          isDirty: false,
        }));
        setTransactions(txns);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedBranch, dateFrom, dateTo, typeFilter, searchQuery, branches]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addNewRow = () => {
    const newTxn: Transaction = {
      id: `new-${Date.now()}`,
      branch_id: selectedBranch,
      branch_name: branches.find((b) => b.id === selectedBranch)?.name || '',
      transaction_type: 'revenue',
      transaction_date: new Date().toISOString().split('T')[0],
      amount: 0,
      service_type: '',
      customer_name: '',
      payment_method: 'cash',
      notes: '',
      approval_status: 'pending',
      isNew: true,
      isDirty: true,
    };
    setTransactions([newTxn, ...transactions]);
    setHasChanges(true);
    setEditingCell({ rowId: newTxn.id, field: 'transaction_date' });
  };

  const updateTransaction = (id: string, field: keyof Transaction, value: string | number) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, [field]: value, isDirty: true };
          if (field === 'transaction_type') {
            if (value === 'revenue') {
              updated.expense_category = undefined;
              updated.vendor_name = undefined;
            } else {
              updated.service_type = undefined;
              updated.customer_name = undefined;
            }
          }
          return updated;
        }
        return t;
      })
    );
    setHasChanges(true);
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setHasChanges(true);
  };

  const saveChanges = async () => {
    setSaving(true);
    try {
      const dirtyTxns = transactions.filter((t) => t.isDirty);

      for (const txn of dirtyTxns) {
        const payload = {
          branch_id: txn.branch_id,
          transaction_type: txn.transaction_type,
          transaction_date: txn.transaction_date,
          amount: Number(txn.amount),
          service_type: txn.service_type,
          customer_name: txn.customer_name,
          expense_category: txn.expense_category,
          vendor_name: txn.vendor_name,
          payment_method: txn.payment_method,
          notes: txn.notes,
          approval_status: txn.approval_status,
        };

        if (txn.isNew) {
          await fetch('/api/finances/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          // Update existing transaction
          await fetch(`/api/finances/transactions/${txn.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        }
      }

      await fetchTransactions();
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  // Process payments - mark as approved and processed
  const processPayments = async () => {
    if (selectedIds.size === 0) return;

    setProcessingIds(new Set(selectedIds));
    try {
      const idsToProcess = Array.from(selectedIds);

      for (const id of idsToProcess) {
        await fetch(`/api/finances/transactions/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ approval_status: 'approved' }),
        });
      }

      await fetchTransactions();
      setSelectedIds(new Set());
      setShowProcessModal(false);
    } catch (error) {
      console.error('Error processing payments:', error);
    } finally {
      setProcessingIds(new Set());
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === transactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(transactions.map((t) => t.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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
    a.download = `transactions-${selectedBranch}-${dateFrom}-${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalRevenue = transactions.filter((t) => t.transaction_type === 'revenue').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter((t) => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netAmount = totalRevenue - totalExpenses;
  const pendingCount = transactions.filter((t) => t.approval_status === 'pending').length;

  const selectedBranchName = branches.find((b) => b.id === selectedBranch)?.name || 'Select Branch';

  const isEditingCell = (rowId: string, field: string) => {
    return editingCell?.rowId === rowId && editingCell?.field === field;
  };

  const startEditing = (rowId: string, field: string) => {
    setEditingCell({ rowId, field });
  };

  const finishEditing = () => {
    setEditingCell(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Airtable-style Header */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/finances"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </Link>

              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>

              <div>
                <h1 className="text-xl font-semibold">Transactions</h1>
                <p className="text-purple-200 text-sm">{selectedBranchName} • {totalCount} records</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
                Views
              </button>
              <button className="px-3 py-1.5 bg-white/20 rounded-lg text-sm hover:bg-white/30 transition-colors">
                Share
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs + Toolbar */}
      <div className="bg-white border-b sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                <span>☰</span> Grid view
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-full text-sm text-gray-600">
                <span>📊</span> Gallery
              </button>
              <button className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-gray-100 rounded-full text-sm text-gray-600">
                <span>📅</span> Calendar
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Branch Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                  className="flex items-center gap-2 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                >
                  <Building2 className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">{selectedBranchName}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>

                {showBranchDropdown && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowBranchDropdown(false)} />
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border py-2 min-w-[200px] z-30">
                      {branches.map((branch) => (
                        <button
                          key={branch.id}
                          onClick={() => {
                            setSelectedBranch(branch.id);
                            setShowBranchDropdown(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                            selectedBranch === branch.id ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {branch.name}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="w-px h-6 bg-gray-200" />

              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Find..."
                  className="w-48 pl-9 pr-3 py-1.5 bg-gray-100 border-0 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:bg-white transition-colors"
                />
              </div>

              {/* Type Filter */}
              <div className="relative">
                <button
                  onClick={() => setShowTypeFilter(!showTypeFilter)}
                  className="flex items-center gap-1 px-3 py-1.5 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                >
                  <Filter className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {typeFilter === 'all' ? 'Filter' : typeFilter === 'revenue' ? 'Revenue' : 'Expense'}
                  </span>
                </button>

                {showTypeFilter && (
                  <>
                    <div className="fixed inset-0 z-20" onClick={() => setShowTypeFilter(false)} />
                    <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-lg border py-2 min-w-[150px] z-30">
                      {['all', 'revenue', 'expense'].map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setTypeFilter(type as typeof typeFilter);
                            setShowTypeFilter(false);
                          }}
                          className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors ${
                            typeFilter === type ? 'bg-purple-50 text-purple-700 font-medium' : 'text-gray-700'
                          }`}
                        >
                          {type === 'all' ? 'All Types' : type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Date Range */}
              <div className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-1">
                <Calendar className="w-4 h-4 text-gray-500" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="bg-transparent border-0 text-sm text-gray-700 focus:ring-0 w-28"
                />
                <span className="text-gray-400">→</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="bg-transparent border-0 text-sm text-gray-700 focus:ring-0 w-28"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="bg-white border-b">
        <div className="max-w-[1600px] mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedIds.size > 0 && (
              <>
                <span className="text-sm text-gray-600">
                  {selectedIds.size} selected
                </span>
                <button
                  onClick={() => setShowProcessModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Process Payments
                </button>
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors"
                >
                  <X className="w-4 h-4" />
                  Clear
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <button
                onClick={saveChanges}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save
              </button>
            )}

            <button
              onClick={exportCSV}
              className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>

            <button
              onClick={addNewRow}
              className="flex items-center gap-2 px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Record
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-6 py-4">
        {/* Airtable-style Table */}
        <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="w-10 px-2 py-3 border-b border-r">
                      <input
                        type="checkbox"
                        checked={selectedIds.size === transactions.length && transactions.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                    </th>
                    <th className="px-3 py-3 border-b border-r text-left font-medium text-gray-600 min-w-[110px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-purple-500">📅</span> Date
                      </div>
                    </th>
                    <th className="px-3 py-3 border-b border-r text-left font-medium text-gray-600 min-w-[100px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-green-500">🏷️</span> Type
                      </div>
                    </th>
                    <th className="px-3 py-3 border-b border-r text-left font-medium text-gray-600 min-w-[120px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-blue-500">📦</span> Service
                      </div>
                    </th>
                    <th className="px-3 py-3 border-b border-r text-left font-medium text-gray-600 min-w-[180px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-orange-500">👤</span> Customer/Vendor
                      </div>
                    </th>
                    <th className="px-3 py-3 border-b border-r text-left font-medium text-gray-600 min-w-[110px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-cyan-500">💳</span> Payment
                      </div>
                    </th>
                    <th className="px-3 py-3 border-b border-r text-right font-medium text-gray-600 min-w-[130px]">
                      <div className="flex items-center justify-end gap-1.5">
                        <span className="text-yellow-500">💰</span> Amount
                      </div>
                    </th>
                    <th className="px-3 py-3 border-b border-r text-left font-medium text-gray-600 min-w-[90px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-500">✓</span> Status
                      </div>
                    </th>
                    <th className="px-3 py-3 border-b text-left font-medium text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <span className="text-gray-400">📝</span> Notes
                      </div>
                    </th>
                    <th className="w-10 px-2 py-3 border-b"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn, index) => (
                    <tr
                      key={txn.id}
                      className={`group border-b transition-colors ${
                        txn.isNew
                          ? 'bg-green-50/50'
                          : txn.isDirty
                          ? 'bg-amber-50/50'
                          : selectedIds.has(txn.id)
                          ? 'bg-purple-50'
                          : 'hover:bg-purple-50/30'
                      }`}
                    >
                      {/* Checkbox + Row Number */}
                      <td className="px-2 py-2 border-r bg-gray-50/50">
                        <div className="flex items-center gap-1">
                          <span className="opacity-0 group-hover:opacity-100 cursor-move text-gray-400">
                            <GripVertical className="w-3 h-3" />
                          </span>
                          <input
                            type="checkbox"
                            checked={selectedIds.has(txn.id)}
                            onChange={() => toggleSelect(txn.id)}
                            className="w-4 h-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                          />
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-3 py-2 border-r">
                        <InlineCell
                          value={txn.transaction_date}
                          displayValue={<span className="text-sm">{formatDate(txn.transaction_date)}</span>}
                          isEditing={isEditingCell(txn.id, 'transaction_date')}
                          onStartEdit={() => startEditing(txn.id, 'transaction_date')}
                          onChange={(v) => updateTransaction(txn.id, 'transaction_date', v)}
                          onFinishEdit={finishEditing}
                          type="date"
                        />
                      </td>

                      {/* Type */}
                      <td className="px-3 py-2 border-r">
                        <InlineCell
                          value={txn.transaction_type}
                          displayValue={
                            <span
                              className={`inline-block px-2 py-1 rounded-full text-xs font-medium text-white ${
                                txn.transaction_type === 'revenue' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                            >
                              {txn.transaction_type === 'revenue' ? 'Revenue' : 'Expense'}
                            </span>
                          }
                          isEditing={isEditingCell(txn.id, 'transaction_type')}
                          onStartEdit={() => startEditing(txn.id, 'transaction_type')}
                          onChange={(v) => updateTransaction(txn.id, 'transaction_type', v)}
                          onFinishEdit={finishEditing}
                          type="select"
                          options={['revenue', 'expense']}
                        />
                      </td>

                      {/* Category/Service */}
                      <td className="px-3 py-2 border-r">
                        <InlineCell
                          value={txn.transaction_type === 'revenue' ? txn.service_type || '' : txn.expense_category || ''}
                          displayValue={
                            txn.service_type || txn.expense_category ? (
                              <CategoryBadge
                                category={txn.service_type || txn.expense_category || ''}
                                type={txn.transaction_type}
                              />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          }
                          isEditing={isEditingCell(txn.id, 'category')}
                          onStartEdit={() => startEditing(txn.id, 'category')}
                          onChange={(v) =>
                            updateTransaction(
                              txn.id,
                              txn.transaction_type === 'revenue' ? 'service_type' : 'expense_category',
                              v
                            )
                          }
                          onFinishEdit={finishEditing}
                          type="select"
                          options={txn.transaction_type === 'revenue' ? SERVICE_TYPES : EXPENSE_CATEGORIES}
                        />
                      </td>

                      {/* Customer/Vendor */}
                      <td className="px-3 py-2 border-r">
                        <InlineCell
                          value={txn.transaction_type === 'revenue' ? txn.customer_name || '' : txn.vendor_name || ''}
                          displayValue={
                            txn.customer_name || txn.vendor_name ? (
                              <div className="flex items-center gap-2">
                                <AvatarBadge name={txn.customer_name || txn.vendor_name || ''} />
                                <span>{txn.customer_name || txn.vendor_name}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          }
                          isEditing={isEditingCell(txn.id, 'description')}
                          onStartEdit={() => startEditing(txn.id, 'description')}
                          onChange={(v) =>
                            updateTransaction(
                              txn.id,
                              txn.transaction_type === 'revenue' ? 'customer_name' : 'vendor_name',
                              v
                            )
                          }
                          onFinishEdit={finishEditing}
                          placeholder={txn.transaction_type === 'revenue' ? 'Customer name' : 'Vendor name'}
                        />
                      </td>

                      {/* Payment Method */}
                      <td className="px-3 py-2 border-r">
                        <InlineCell
                          value={txn.payment_method || ''}
                          displayValue={
                            txn.payment_method ? (
                              <PaymentBadge method={txn.payment_method} />
                            ) : (
                              <span className="text-gray-400">—</span>
                            )
                          }
                          isEditing={isEditingCell(txn.id, 'payment_method')}
                          onStartEdit={() => startEditing(txn.id, 'payment_method')}
                          onChange={(v) => updateTransaction(txn.id, 'payment_method', v)}
                          onFinishEdit={finishEditing}
                          type="select"
                          options={PAYMENT_METHODS}
                        />
                      </td>

                      {/* Amount */}
                      <td className="px-3 py-2 border-r">
                        <InlineCell
                          value={txn.amount}
                          displayValue={
                            <span
                              className={`font-medium tabular-nums ${
                                txn.transaction_type === 'revenue' ? 'text-green-600' : 'text-red-600'
                              }`}
                            >
                              {txn.transaction_type === 'expense' ? '-' : ''}
                              {formatCurrency(txn.amount)}
                            </span>
                          }
                          isEditing={isEditingCell(txn.id, 'amount')}
                          onStartEdit={() => startEditing(txn.id, 'amount')}
                          onChange={(v) => updateTransaction(txn.id, 'amount', parseFloat(v) || 0)}
                          onFinishEdit={finishEditing}
                          type="number"
                          align="right"
                        />
                      </td>

                      {/* Status */}
                      <td className="px-3 py-2 border-r">
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

                      {/* Notes */}
                      <td className="px-3 py-2">
                        <InlineCell
                          value={txn.notes || ''}
                          displayValue={
                            <span className="text-gray-500 truncate block max-w-[200px]">
                              {txn.notes || <span className="text-gray-400">—</span>}
                            </span>
                          }
                          isEditing={isEditingCell(txn.id, 'notes')}
                          onStartEdit={() => startEditing(txn.id, 'notes')}
                          onChange={(v) => updateTransaction(txn.id, 'notes', v)}
                          onFinishEdit={finishEditing}
                          placeholder="Add note..."
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-2 py-2">
                        <button
                          onClick={() => deleteTransaction(txn.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Add Row Button */}
              {transactions.length > 0 && (
                <div
                  className="px-4 py-3 border-t hover:bg-purple-50 cursor-pointer text-purple-600 text-sm font-medium transition-colors"
                  onClick={addNewRow}
                >
                  + Add record
                </div>
              )}

              {/* Empty state */}
              {transactions.length === 0 && !loading && (
                <div className="py-16 text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wallet className="w-8 h-8 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-1">No transactions yet</h3>
                  <p className="text-sm text-gray-500 mb-4">Get started by adding your first transaction</p>
                  <button
                    onClick={addNewRow}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Transaction
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Footer with summary */}
          <div className="px-4 py-3 bg-gray-50 border-t text-xs text-gray-600 flex justify-between items-center">
            <span>{totalCount} records • {pendingCount} pending</span>
            <div className="flex items-center gap-6">
              <span>Revenue: <strong className="text-green-600">{formatCurrency(totalRevenue)}</strong></span>
              <span>Expenses: <strong className="text-red-600">{formatCurrency(totalExpenses)}</strong></span>
              <span>Net: <strong className={netAmount >= 0 ? 'text-purple-600' : 'text-red-600'}>{formatCurrency(netAmount)}</strong></span>
            </div>
          </div>
        </div>

        {/* Unsaved changes banner */}
        {hasChanges && (
          <div className="mt-4 flex items-center justify-between bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
            <div className="flex items-center gap-2 text-amber-700">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium">
                {transactions.filter((t) => t.isDirty).length} unsaved change{transactions.filter((t) => t.isDirty).length > 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={saveChanges}
              disabled={saving}
              className="flex items-center gap-2 px-3 py-1.5 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition-colors disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Now
            </button>
          </div>
        )}
      </div>

      {/* Process Payments Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Process Payments</h3>
                <p className="text-sm text-gray-500">Mark selected transactions as approved</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Transactions to process:</span>
                <span className="font-semibold text-gray-900">{selectedIds.size}</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-2">
                <span className="text-gray-600">Total amount:</span>
                <span className="font-semibold text-green-600">
                  {formatCurrency(
                    transactions
                      .filter((t) => selectedIds.has(t.id))
                      .reduce((sum, t) => sum + (t.transaction_type === 'revenue' ? t.amount : -t.amount), 0)
                  )} UZS
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowProcessModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={processPayments}
                disabled={processingIds.size > 0}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processingIds.size > 0 ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Process Payments
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
