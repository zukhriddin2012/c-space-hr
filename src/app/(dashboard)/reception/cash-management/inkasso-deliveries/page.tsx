'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CheckSquare, Square, Send, FileCheck } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/modules/reception/lib/constants';
import { useReceptionMode } from '@/contexts/ReceptionModeContext';
import type { InkassoDelivery } from '@/modules/reception/types';

interface UndeliveredTransaction {
  id: string;
  transactionNumber: string;
  customerName: string;
  serviceTypeName?: string;
  amount: number;
  agentName?: string;
  transactionDate: string;
}

export default function InkassoDeliveriesPage() {
  const { selectedBranch } = useReceptionMode();
  const [undelivered, setUndelivered] = useState<UndeliveredTransaction[]>([]);
  const [deliveryHistory, setDeliveryHistory] = useState<InkassoDelivery[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notes, setNotes] = useState('');

  const branchId = selectedBranch?.id;

  const fetchData = useCallback(async () => {
    if (!branchId || selectedBranch?.isAllBranches) return;
    setIsLoading(true);
    try {
      const [undeliveredRes, historyRes] = await Promise.all([
        fetch(`/api/reception/cash-management/inkasso-undelivered?branchId=${branchId}`),
        fetch(`/api/reception/cash-management/inkasso-deliveries?branchId=${branchId}`),
      ]);

      if (undeliveredRes.ok) {
        const data = await undeliveredRes.json();
        setUndelivered(data.transactions || []);
      }
      if (historyRes.ok) {
        const data = await historyRes.json();
        setDeliveryHistory(data.data || []);
      }
    } catch {
      // Silent fail
    } finally {
      setIsLoading(false);
    }
  }, [branchId, selectedBranch?.isAllBranches]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === undelivered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(undelivered.map(t => t.id)));
    }
  };

  const selectedTotal = undelivered
    .filter(t => selectedIds.has(t.id))
    .reduce((sum, t) => sum + t.amount, 0);

  const handleSubmit = async () => {
    if (!branchId || selectedIds.size === 0) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reception/cash-management/inkasso-deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId,
          transactionIds: Array.from(selectedIds),
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create delivery');
      }

      setSelectedIds(new Set());
      setNotes('');
      setShowConfirm(false);
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/reception/cash-management" className="text-purple-600 hover:text-purple-800">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h2 className="text-xl font-bold text-gray-900">Inkasso Deliveries</h2>
      </div>

      {/* Undelivered Transactions */}
      <Card title={`Pending Delivery (${undelivered.length})`} noPadding>
        {undelivered.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No inkasso transactions pending delivery</p>
        ) : (
          <>
            {/* Selection bar */}
            <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
              <button onClick={toggleAll} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                {selectedIds.size === undelivered.length ? (
                  <CheckSquare className="w-4 h-4 text-purple-600" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
                {selectedIds.size > 0
                  ? `${selectedIds.size} selected (${formatCurrency(selectedTotal)})`
                  : 'Select all'}
              </button>
              {selectedIds.size > 0 && (
                <Button
                  size="sm"
                  onClick={() => setShowConfirm(true)}
                  className="flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  Mark as Delivered
                </Button>
              )}
            </div>

            <div className="divide-y divide-gray-100">
              {undelivered.map((txn) => (
                <div
                  key={txn.id}
                  onClick={() => toggleSelect(txn.id)}
                  className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedIds.has(txn.id) ? 'bg-purple-50' : ''
                  }`}
                >
                  {selectedIds.has(txn.id) ? (
                    <CheckSquare className="w-5 h-5 text-purple-600 flex-shrink-0" />
                  ) : (
                    <Square className="w-5 h-5 text-gray-300 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{txn.customerName}</p>
                    <p className="text-xs text-gray-500">
                      {txn.transactionNumber} &middot; {txn.serviceTypeName} &middot; {txn.agentName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(txn.amount)}</p>
                    <p className="text-xs text-gray-400">{txn.transactionDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Confirm Delivery</h3>
            <p className="text-sm text-gray-600">
              You are about to mark <strong>{selectedIds.size}</strong> transactions
              totaling <strong>{formatCurrency(selectedTotal)}</strong> as delivered to tax authorities.
            </p>
            <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg">
              This action cannot be undone. Delivered transactions cannot be re-delivered.
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full border rounded-lg p-2 text-sm"
                rows={2}
                placeholder="e.g., Delivered to Tax Office #3"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Confirm Delivery'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery History */}
      <Card title="Delivery History" noPadding>
        {deliveryHistory.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No deliveries recorded yet</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {deliveryHistory.map((delivery) => (
              <div key={delivery.id} className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                    <FileCheck className="w-5 h-5 text-teal-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {delivery.transactionCount} transactions
                    </p>
                    <p className="text-xs text-gray-500">
                      {delivery.deliveredByName} &middot; {delivery.deliveredDate}
                    </p>
                  </div>
                </div>
                <p className="font-semibold text-teal-700">{formatCurrency(delivery.totalAmount)}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
