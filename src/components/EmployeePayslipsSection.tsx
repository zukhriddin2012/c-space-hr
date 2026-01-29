'use client';

import { useState, useEffect } from 'react';
import { Receipt, Plus, Pencil, Trash2, X, Check, ChevronDown, ChevronUp } from 'lucide-react';

interface Payslip {
  id: string;
  employee_id: string;
  year: number;
  month: number;
  advance_bank: number;
  advance_naqd: number;
  salary_bank: number;
  salary_naqd: number;
  gross_salary: number;
  net_salary: number;
  status: string;
  notes: string | null;
  legal_entity_id: string | null;
  legal_entities?: {
    name: string;
    short_name: string | null;
  };
}

interface EmployeePayslipsSectionProps {
  employeeId: string;
  canEdit: boolean;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function formatCurrency(amount: number): string {
  if (!amount || amount === 0) return '-';
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

function formatCompact(amount: number): string {
  if (!amount) return '0';
  if (amount >= 1000000) return (amount / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (amount >= 1000) return (amount / 1000).toFixed(0) + 'K';
  return amount.toString();
}

export default function EmployeePayslipsSection({ employeeId, canEdit }: EmployeePayslipsSectionProps) {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Payslip>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPayslip, setNewPayslip] = useState({
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    advance_bank: 0,
    advance_naqd: 0,
    salary_bank: 0,
    salary_naqd: 0,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  // Fetch payslips
  useEffect(() => {
    async function fetchPayslips() {
      try {
        const response = await fetch(`/api/employees/${employeeId}/payslips`);
        if (response.ok) {
          const data = await response.json();
          setPayslips(data.payslips || []);
        }
      } catch (err) {
        console.error('Error fetching payslips:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchPayslips();
  }, [employeeId]);

  const handleEdit = (payslip: Payslip) => {
    setEditingId(payslip.id);
    setEditForm({
      advance_bank: payslip.advance_bank,
      advance_naqd: payslip.advance_naqd,
      salary_bank: payslip.salary_bank,
      salary_naqd: payslip.salary_naqd,
      notes: payslip.notes,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    setSaving(true);
    try {
      const response = await fetch(`/api/employees/${employeeId}/payslips`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payslip_id: editingId, ...editForm }),
      });
      if (response.ok) {
        const data = await response.json();
        setPayslips(prev => prev.map(p => p.id === editingId ? { ...p, ...editForm, ...data.payslip } : p));
        setEditingId(null);
      }
    } catch (err) {
      console.error('Error saving payslip:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (payslipId: string) => {
    if (!confirm('Are you sure you want to delete this payslip record?')) return;
    try {
      const response = await fetch(`/api/employees/${employeeId}/payslips?payslip_id=${payslipId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setPayslips(prev => prev.filter(p => p.id !== payslipId));
      }
    } catch (err) {
      console.error('Error deleting payslip:', err);
    }
  };

  const handleAddPayslip = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/employees/${employeeId}/payslips`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPayslip),
      });
      if (response.ok) {
        const data = await response.json();
        setPayslips(prev => [data.payslip, ...prev].sort((a, b) => {
          if (a.year !== b.year) return b.year - a.year;
          return b.month - a.month;
        }));
        setShowAddForm(false);
        setNewPayslip({
          year: new Date().getFullYear(),
          month: new Date().getMonth() + 1,
          advance_bank: 0,
          advance_naqd: 0,
          salary_bank: 0,
          salary_naqd: 0,
          notes: '',
        });
      }
    } catch (err) {
      console.error('Error adding payslip:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-100 rounded"></div>
        </div>
      </div>
    );
  }

  const displayPayslips = expanded ? payslips : payslips.slice(0, 6);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Receipt size={20} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">Payment History</h3>
          <span className="text-sm text-gray-500">({payslips.length} records)</span>
        </div>
        {canEdit && (
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Plus size={16} />
            Add Payslip
          </button>
        )}
      </div>

      {/* Add New Payslip Form */}
      {showAddForm && (
        <div className="mb-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-purple-900">Add New Payslip</h4>
            <button onClick={() => setShowAddForm(false)} className="text-purple-500 hover:text-purple-700">
              <X size={18} />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div>
              <label className="block text-xs text-purple-700 mb-1">Year</label>
              <input
                type="number"
                value={newPayslip.year}
                onChange={(e) => setNewPayslip(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-purple-700 mb-1">Month</label>
              <select
                value={newPayslip.month}
                onChange={(e) => setNewPayslip(prev => ({ ...prev, month: parseInt(e.target.value) }))}
                className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx} value={idx + 1}>{name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-purple-700 mb-1">Advance (Bank)</label>
              <input
                type="number"
                value={newPayslip.advance_bank}
                onChange={(e) => setNewPayslip(prev => ({ ...prev, advance_bank: parseFloat(e.target.value) || 0 }))}
                className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-purple-700 mb-1">Advance (Cash)</label>
              <input
                type="number"
                value={newPayslip.advance_naqd}
                onChange={(e) => setNewPayslip(prev => ({ ...prev, advance_naqd: parseFloat(e.target.value) || 0 }))}
                className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-purple-700 mb-1">Salary (Bank)</label>
              <input
                type="number"
                value={newPayslip.salary_bank}
                onChange={(e) => setNewPayslip(prev => ({ ...prev, salary_bank: parseFloat(e.target.value) || 0 }))}
                className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-purple-700 mb-1">Salary (Cash)</label>
              <input
                type="number"
                value={newPayslip.salary_naqd}
                onChange={(e) => setNewPayslip(prev => ({ ...prev, salary_naqd: parseFloat(e.target.value) || 0 }))}
                className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-purple-700 mb-1">Notes</label>
              <input
                type="text"
                value={newPayslip.notes}
                onChange={(e) => setNewPayslip(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Optional notes"
                className="w-full px-2 py-1.5 text-sm border border-purple-300 rounded focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleAddPayslip}
              disabled={saving}
              className="px-4 py-1.5 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Add Payslip'}
            </button>
          </div>
        </div>
      )}

      {/* Payslips Table */}
      {payslips.length === 0 ? (
        <div className="text-center py-8 text-gray-400">
          <Receipt size={40} className="mx-auto mb-2 text-gray-300" />
          <p>No payment history found</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-3 py-2 text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase">Advance</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase">Salary</th>
                <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase">Total</th>
                {canEdit && <th className="text-right px-3 py-2 text-xs font-medium text-gray-500 uppercase w-20">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {displayPayslips.map((payslip) => {
                const total = (payslip.advance_bank || 0) + (payslip.advance_naqd || 0) +
                              (payslip.salary_bank || 0) + (payslip.salary_naqd || 0);
                const isEditing = editingId === payslip.id;

                return (
                  <tr key={payslip.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <p className="font-medium text-gray-900">
                        {MONTH_NAMES[payslip.month - 1]} {payslip.year}
                      </p>
                      {payslip.notes && (
                        <p className="text-xs text-gray-500 truncate max-w-[150px]">{payslip.notes}</p>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {isEditing ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="number"
                            value={editForm.advance_bank || 0}
                            onChange={(e) => setEditForm(prev => ({ ...prev, advance_bank: parseFloat(e.target.value) || 0 }))}
                            className="w-24 px-1 py-0.5 text-xs border rounded ml-auto"
                            placeholder="Bank"
                          />
                          <input
                            type="number"
                            value={editForm.advance_naqd || 0}
                            onChange={(e) => setEditForm(prev => ({ ...prev, advance_naqd: parseFloat(e.target.value) || 0 }))}
                            className="w-24 px-1 py-0.5 text-xs border rounded ml-auto"
                            placeholder="Cash"
                          />
                        </div>
                      ) : (
                        <div>
                          {(payslip.advance_bank || 0) > 0 && (
                            <p className="text-gray-900">{formatCompact(payslip.advance_bank)} <span className="text-xs text-gray-400">bank</span></p>
                          )}
                          {(payslip.advance_naqd || 0) > 0 && (
                            <p className="text-gray-900">{formatCompact(payslip.advance_naqd)} <span className="text-xs text-gray-400">cash</span></p>
                          )}
                          {(payslip.advance_bank || 0) === 0 && (payslip.advance_naqd || 0) === 0 && '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {isEditing ? (
                        <div className="flex flex-col gap-1">
                          <input
                            type="number"
                            value={editForm.salary_bank || 0}
                            onChange={(e) => setEditForm(prev => ({ ...prev, salary_bank: parseFloat(e.target.value) || 0 }))}
                            className="w-24 px-1 py-0.5 text-xs border rounded ml-auto"
                            placeholder="Bank"
                          />
                          <input
                            type="number"
                            value={editForm.salary_naqd || 0}
                            onChange={(e) => setEditForm(prev => ({ ...prev, salary_naqd: parseFloat(e.target.value) || 0 }))}
                            className="w-24 px-1 py-0.5 text-xs border rounded ml-auto"
                            placeholder="Cash"
                          />
                        </div>
                      ) : (
                        <div>
                          {(payslip.salary_bank || 0) > 0 && (
                            <p className="text-gray-900">{formatCompact(payslip.salary_bank)} <span className="text-xs text-gray-400">bank</span></p>
                          )}
                          {(payslip.salary_naqd || 0) > 0 && (
                            <p className="text-gray-900">{formatCompact(payslip.salary_naqd)} <span className="text-xs text-gray-400">cash</span></p>
                          )}
                          {(payslip.salary_bank || 0) === 0 && (payslip.salary_naqd || 0) === 0 && '-'}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-purple-700">
                      {formatCompact(total)}
                    </td>
                    {canEdit && (
                      <td className="px-3 py-2 text-right">
                        {isEditing ? (
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={handleSaveEdit}
                              disabled={saving}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Check size={16} />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 text-gray-400 hover:bg-gray-100 rounded"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-1">
                            <button
                              onClick={() => handleEdit(payslip)}
                              className="p-1 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(payslip.id)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Show more/less button */}
          {payslips.length > 6 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="w-full py-2 text-sm text-purple-600 hover:bg-purple-50 border-t border-gray-200 flex items-center justify-center gap-1"
            >
              {expanded ? (
                <>
                  <ChevronUp size={16} />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown size={16} />
                  Show all {payslips.length} records
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
