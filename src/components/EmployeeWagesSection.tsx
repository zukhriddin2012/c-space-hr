'use client';

import { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, DollarSign, X } from 'lucide-react';

interface LegalEntity {
  id: string;
  name: string;
  short_name: string | null;
  inn: string | null;
  branch_id: string | null;
}

interface EmployeeWage {
  id: string;
  employee_id: string;
  legal_entity_id: string;
  wage_amount: number;
  wage_type: 'official' | 'bonus';
  notes: string | null;
  is_active: boolean;
  legal_entities?: LegalEntity;
}

interface EmployeeWagesSectionProps {
  employeeId: string;
  canEdit: boolean;
}

function formatSalary(amount: number): string {
  if (!amount || amount === 0) return '-';
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

export default function EmployeeWagesSection({ employeeId, canEdit }: EmployeeWagesSectionProps) {
  const [wages, setWages] = useState<EmployeeWage[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [legalEntities, setLegalEntities] = useState<LegalEntity[]>([]);

  // Fetch wages
  useEffect(() => {
    async function fetchWages() {
      try {
        const response = await fetch(`/api/employees/${employeeId}/wages`);
        if (response.ok) {
          const data = await response.json();
          setWages(data.wages || []);
          setTotal(data.total || 0);
        }
      } catch (err) {
        console.error('Error fetching wages:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchWages();
  }, [employeeId]);

  // Fetch legal entities when modal opens
  useEffect(() => {
    if (showAddModal && legalEntities.length === 0) {
      async function fetchEntities() {
        try {
          const response = await fetch('/api/legal-entities');
          if (response.ok) {
            const data = await response.json();
            setLegalEntities(data.entities || []);
          }
        } catch (err) {
          console.error('Error fetching entities:', err);
        }
      }
      fetchEntities();
    }
  }, [showAddModal, legalEntities.length]);

  const handleAddWage = async (entityId: string, amount: number, notes: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/employees/${employeeId}/wages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legal_entity_id: entityId,
          wage_amount: amount,
          wage_type: 'official',
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to add wage');
      }

      // Refresh wages
      const wagesResponse = await fetch(`/api/employees/${employeeId}/wages`);
      if (wagesResponse.ok) {
        const data = await wagesResponse.json();
        setWages(data.wages || []);
        setTotal(data.total || 0);
      }
      setShowAddModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add wage');
    }
  };

  const handleRemoveWage = async (wageId: string) => {
    if (!confirm('Are you sure you want to remove this wage entry?')) return;

    try {
      const response = await fetch(`/api/employees/${employeeId}/wages?wage_id=${wageId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setWages(wages.filter(w => w.id !== wageId));
        setTotal(wages.filter(w => w.id !== wageId).reduce((sum, w) => sum + w.wage_amount, 0));
      }
    } catch (err) {
      console.error('Error removing wage:', err);
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

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Building2 size={20} className="text-purple-600" />
          Wage Distribution by Legal Entity
        </h3>
        {canEdit && (
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
          >
            <Plus size={16} />
            Add Wage
          </button>
        )}
      </div>

      {/* Total */}
      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-purple-600 mb-1">Total Monthly Wages</p>
            <p className="text-2xl font-bold text-purple-700">{formatSalary(total)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">From {wages.length} {wages.length === 1 ? 'entity' : 'entities'}</p>
          </div>
        </div>
      </div>

      {/* Wages List */}
      {wages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Building2 size={40} className="mx-auto mb-2 text-gray-300" />
          <p>No wage entries yet</p>
          {canEdit && (
            <p className="text-sm mt-1">Click &quot;Add Wage&quot; to assign wages from legal entities</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {wages.map((wage) => (
            <div
              key={wage.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Building2 size={20} className="text-indigo-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {wage.legal_entities?.short_name || wage.legal_entities?.name || wage.legal_entity_id}
                  </p>
                  {wage.legal_entities?.inn && (
                    <p className="text-xs text-gray-500">INN: {wage.legal_entities.inn}</p>
                  )}
                  {wage.notes && (
                    <p className="text-xs text-gray-400 mt-1">{wage.notes}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatSalary(wage.wage_amount)}</p>
                  <p className="text-xs text-gray-500">{wage.wage_type === 'official' ? 'Official' : 'Bonus'}</p>
                </div>
                {canEdit && (
                  <button
                    onClick={() => handleRemoveWage(wage.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Wage Modal */}
      {showAddModal && (
        <AddWageModal
          legalEntities={legalEntities}
          existingEntityIds={wages.map(w => w.legal_entity_id)}
          onAdd={handleAddWage}
          onClose={() => setShowAddModal(false)}
          error={error}
        />
      )}
    </div>
  );
}

function AddWageModal({
  legalEntities,
  existingEntityIds,
  onAdd,
  onClose,
  error,
}: {
  legalEntities: LegalEntity[];
  existingEntityIds: string[];
  onAdd: (entityId: string, amount: number, notes: string) => void;
  onClose: () => void;
  error: string | null;
}) {
  const [selectedEntity, setSelectedEntity] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Filter out already assigned entities
  const availableEntities = legalEntities.filter(e => !existingEntityIds.includes(e.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntity || !amount) return;
    setSaving(true);
    await onAdd(selectedEntity, parseFloat(amount), notes);
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add Wage Entry</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Legal Entity
            </label>
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              required
            >
              <option value="">Select entity...</option>
              {availableEntities.map((entity) => (
                <option key={entity.id} value={entity.id}>
                  {entity.short_name || entity.name} {entity.inn ? `(INN: ${entity.inn})` : ''}
                </option>
              ))}
            </select>
            {availableEntities.length === 0 && (
              <p className="text-sm text-orange-600 mt-1">
                All legal entities are already assigned to this employee
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Monthly Wage Amount (UZS)
            </label>
            <div className="relative">
              <DollarSign size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
                placeholder="5000000"
                min="0"
                step="100000"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              placeholder="e.g., Main salary, Bonus, etc."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !selectedEntity || !amount || availableEntities.length === 0}
              className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Adding...' : 'Add Wage'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
