'use client';

import { useState, useEffect, useCallback, useRef, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
  RefreshCw,
  Download,
  Upload,
  Filter,
  ChevronDown,
  Check,
  X,
  Search,
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
  isEditing?: boolean;
  isDirty?: boolean;
}

interface Branch {
  id: string;
  name: string;
}

// Service types and expense categories
const SERVICE_TYPES = ['Office', 'Dedicated', 'Flex', 'Meeting', 'Conference', 'Hour', 'Day Pass', 'Other'];
const EXPENSE_CATEGORIES = ['Goods', 'Utility', 'Maintenance', 'Staff', 'Marketing', 'Tax', 'CapEx', 'Other'];
const PAYMENT_METHODS = ['cash', 'terminal', 'payme', 'click', 'uzum', 'bank'];

// Format currency
function formatCurrency(amount: number): string {
  return amount.toLocaleString('uz-UZ');
}

// Editable cell component
function EditableCell({
  value,
  onChange,
  onKeyDown,
  type = 'text',
  options,
  placeholder,
  className = '',
  autoFocus = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onKeyDown?: (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>) => void;
  type?: 'text' | 'number' | 'date' | 'select';
  options?: string[];
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}) {
  if (type === 'select' && options) {
    return (
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        className={`w-full px-2 py-1 border-0 bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none rounded ${className}`}
        autoFocus={autoFocus}
      >
        <option value="">—</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      className={`w-full px-2 py-1 border-0 bg-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none rounded ${className}`}
      autoFocus={autoFocus}
    />
  );
}

export default function TransactionsSpreadsheetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [hasChanges, setHasChanges] = useState(false);

  // Filters
  const [showFilters, setShowFilters] = useState(false);
  const [dateFrom, setDateFrom] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  );
  const [dateTo, setDateTo] = useState(new Date().toISOString().split('T')[0]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'revenue' | 'expense'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch branches
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await fetch('/api/branches');
        if (res.ok) {
          const data = await res.json();
          setBranches(data.branches || []);
          // Auto-select first branch with data
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

  // Fetch transactions when branch or filters change
  const fetchTransactions = useCallback(async () => {
    if (!selectedBranch) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        branchId: selectedBranch,
        startDate: dateFrom,
        endDate: dateTo,
        limit: '500', // Get more for spreadsheet view
      });
      if (typeFilter !== 'all') params.set('type', typeFilter);
      if (searchQuery) params.set('search', searchQuery);

      const res = await fetch(`/api/finances/transactions?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        // Add branch name to each transaction
        const branchName = branches.find((b) => b.id === selectedBranch)?.name || '';
        const txns = (data.transactions || []).map((t: Transaction) => ({
          ...t,
          branch_name: branchName,
          isEditing: false,
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

  // Add new row
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
      approval_status: 'approved',
      isNew: true,
      isEditing: true,
      isDirty: true,
    };
    setTransactions([newTxn, ...transactions]);
    setHasChanges(true);
  };

  // Update transaction field
  const updateTransaction = (id: string, field: keyof Transaction, value: string | number) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, [field]: value, isDirty: true };
          // Handle type change - clear irrelevant fields
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

  // Delete transaction
  const deleteTransaction = (id: string) => {
    const txn = transactions.find((t) => t.id === id);
    if (txn?.isNew) {
      // Just remove unsaved new rows
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    } else {
      // Mark for deletion or remove (for now, just remove from view)
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      setHasChanges(true);
    }
  };

  // Save all changes
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
        };

        if (txn.isNew) {
          // Create new transaction
          await fetch('/api/finances/transactions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
        } else {
          // Update existing (TODO: implement update endpoint)
          // For now, we'll just mark as saved
        }
      }

      // Refresh data
      await fetchTransactions();
      setHasChanges(false);
    } catch (error) {
      console.error('Error saving changes:', error);
    } finally {
      setSaving(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement | HTMLSelectElement>, rowIndex: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move to next row or add new row
      if (rowIndex === 0) {
        addNewRow();
      }
    }
    if (e.key === 'Escape') {
      // Cancel editing
      const txn = transactions[rowIndex];
      if (txn?.isNew) {
        deleteTransaction(txn.id);
      }
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = ['Date', 'Type', 'Service/Category', 'Customer/Vendor', 'Payment', 'Amount', 'Notes'];
    const rows = transactions.map((t) => [
      t.transaction_date,
      t.transaction_type,
      t.service_type || t.expense_category || '',
      t.customer_name || t.vendor_name || '',
      t.payment_method || '',
      t.amount.toString(),
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

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Toolbar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/finances" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Transactions</h1>
            <p className="text-xs text-gray-500">{totalCount} records</p>
          </div>

          {/* Branch Selector */}
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="ml-4 px-3 py-1.5 border rounded-lg text-sm bg-white"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-3 py-1.5 border rounded-lg text-sm w-48"
            />
          </div>

          {/* Date Range */}
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm"
          />
          <span className="text-gray-400">to</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-1.5 border rounded-lg text-sm"
          />

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as typeof typeFilter)}
            className="px-3 py-1.5 border rounded-lg text-sm bg-white"
          >
            <option value="all">All Types</option>
            <option value="revenue">Revenue</option>
            <option value="expense">Expense</option>
          </select>

          <div className="w-px h-6 bg-gray-200" />

          {/* Actions */}
          <button
            onClick={addNewRow}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Row
          </button>

          {hasChanges && (
            <button
              onClick={saveChanges}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
            >
              {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save
            </button>
          )}

          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 border rounded-lg text-sm hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Spreadsheet */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 sticky top-0 z-10">
              <tr>
                <th className="w-10 px-2 py-2 text-left text-xs font-semibold text-gray-600 border-b border-r bg-gray-100">
                  #
                </th>
                <th className="w-28 px-2 py-2 text-left text-xs font-semibold text-gray-600 border-b border-r bg-gray-100">
                  Date
                </th>
                <th className="w-24 px-2 py-2 text-left text-xs font-semibold text-gray-600 border-b border-r bg-gray-100">
                  Type
                </th>
                <th className="w-32 px-2 py-2 text-left text-xs font-semibold text-gray-600 border-b border-r bg-gray-100">
                  Service / Category
                </th>
                <th className="min-w-[200px] px-2 py-2 text-left text-xs font-semibold text-gray-600 border-b border-r bg-gray-100">
                  Customer / Vendor
                </th>
                <th className="w-28 px-2 py-2 text-left text-xs font-semibold text-gray-600 border-b border-r bg-gray-100">
                  Payment
                </th>
                <th className="w-32 px-2 py-2 text-right text-xs font-semibold text-gray-600 border-b border-r bg-gray-100">
                  Amount (UZS)
                </th>
                <th className="min-w-[150px] px-2 py-2 text-left text-xs font-semibold text-gray-600 border-b border-r bg-gray-100">
                  Notes
                </th>
                <th className="w-16 px-2 py-2 text-center text-xs font-semibold text-gray-600 border-b bg-gray-100">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn, index) => (
                <tr
                  key={txn.id}
                  className={`
                    ${txn.isNew ? 'bg-green-50' : txn.isDirty ? 'bg-yellow-50' : 'bg-white'}
                    ${index % 2 === 0 ? '' : 'bg-opacity-50'}
                    hover:bg-blue-50 transition-colors
                  `}
                >
                  {/* Row number */}
                  <td className="px-2 py-1 text-xs text-gray-400 border-b border-r text-center">
                    {index + 1}
                  </td>

                  {/* Date */}
                  <td className="px-1 py-0.5 border-b border-r">
                    <EditableCell
                      type="date"
                      value={txn.transaction_date}
                      onChange={(v) => updateTransaction(txn.id, 'transaction_date', v)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="text-sm"
                      autoFocus={txn.isNew && index === 0}
                    />
                  </td>

                  {/* Type */}
                  <td className="px-1 py-0.5 border-b border-r">
                    <EditableCell
                      type="select"
                      options={['revenue', 'expense']}
                      value={txn.transaction_type}
                      onChange={(v) => updateTransaction(txn.id, 'transaction_type', v)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`text-sm font-medium ${
                        txn.transaction_type === 'revenue' ? 'text-green-600' : 'text-red-600'
                      }`}
                    />
                  </td>

                  {/* Service / Category */}
                  <td className="px-1 py-0.5 border-b border-r">
                    <EditableCell
                      type="select"
                      options={txn.transaction_type === 'revenue' ? SERVICE_TYPES : EXPENSE_CATEGORIES}
                      value={txn.transaction_type === 'revenue' ? txn.service_type || '' : txn.expense_category || ''}
                      onChange={(v) =>
                        updateTransaction(
                          txn.id,
                          txn.transaction_type === 'revenue' ? 'service_type' : 'expense_category',
                          v
                        )
                      }
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="text-sm"
                    />
                  </td>

                  {/* Customer / Vendor */}
                  <td className="px-1 py-0.5 border-b border-r">
                    <EditableCell
                      value={txn.transaction_type === 'revenue' ? txn.customer_name || '' : txn.vendor_name || ''}
                      onChange={(v) =>
                        updateTransaction(
                          txn.id,
                          txn.transaction_type === 'revenue' ? 'customer_name' : 'vendor_name',
                          v
                        )
                      }
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder={txn.transaction_type === 'revenue' ? 'Customer name' : 'Vendor name'}
                      className="text-sm"
                    />
                  </td>

                  {/* Payment Method */}
                  <td className="px-1 py-0.5 border-b border-r">
                    <EditableCell
                      type="select"
                      options={PAYMENT_METHODS}
                      value={txn.payment_method || ''}
                      onChange={(v) => updateTransaction(txn.id, 'payment_method', v)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className="text-sm capitalize"
                    />
                  </td>

                  {/* Amount */}
                  <td className="px-1 py-0.5 border-b border-r">
                    <EditableCell
                      type="number"
                      value={txn.amount.toString()}
                      onChange={(v) => updateTransaction(txn.id, 'amount', parseFloat(v) || 0)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      className={`text-sm font-mono text-right ${
                        txn.transaction_type === 'revenue' ? 'text-green-600' : 'text-red-600'
                      }`}
                    />
                  </td>

                  {/* Notes */}
                  <td className="px-1 py-0.5 border-b border-r">
                    <EditableCell
                      value={txn.notes || ''}
                      onChange={(v) => updateTransaction(txn.id, 'notes', v)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder="Notes"
                      className="text-sm text-gray-600"
                    />
                  </td>

                  {/* Actions */}
                  <td className="px-2 py-1 border-b text-center">
                    <button
                      onClick={() => deleteTransaction(txn.id)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {/* Empty state */}
              {transactions.length === 0 && !loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-gray-500">
                    <p className="mb-2">No transactions found</p>
                    <button
                      onClick={addNewRow}
                      className="text-blue-500 hover:text-blue-600"
                    >
                      + Add your first transaction
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer with totals */}
      <div className="bg-white border-t px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="text-sm text-gray-500">
          {transactions.filter((t) => t.isDirty).length > 0 && (
            <span className="text-amber-600">
              {transactions.filter((t) => t.isDirty).length} unsaved changes
            </span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="text-gray-500">Revenue:</span>{' '}
            <span className="font-semibold text-green-600">
              +{formatCurrency(transactions.filter((t) => t.transaction_type === 'revenue').reduce((sum, t) => sum + t.amount, 0))}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Expenses:</span>{' '}
            <span className="font-semibold text-red-600">
              -{formatCurrency(transactions.filter((t) => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0))}
            </span>
          </div>
          <div className="text-sm">
            <span className="text-gray-500">Net:</span>{' '}
            <span className={`font-semibold ${
              transactions.filter((t) => t.transaction_type === 'revenue').reduce((sum, t) => sum + t.amount, 0) -
              transactions.filter((t) => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0) >= 0
                ? 'text-blue-600'
                : 'text-red-600'
            }`}>
              {formatCurrency(
                transactions.filter((t) => t.transaction_type === 'revenue').reduce((sum, t) => sum + t.amount, 0) -
                transactions.filter((t) => t.transaction_type === 'expense').reduce((sum, t) => sum + t.amount, 0)
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
