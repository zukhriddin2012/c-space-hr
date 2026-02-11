'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Shield } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/modules/reception/lib/constants';
import { useReceptionMode } from '@/contexts/ReceptionModeContext';
import { useAuth } from '@/contexts/AuthContext';
import type { CashTransfer, CashAllocationBalance } from '@/modules/reception/types';

export default function CashTransfersPage() {
  const { selectedBranch } = useReceptionMode();
  const { user } = useAuth();
  const [transfers, setTransfers] = useState<CashTransfer[]>([]);
  const [balance, setBalance] = useState<CashAllocationBalance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [dividendAmount, setDividendAmount] = useState('');
  const [marketingAmount, setMarketingAmount] = useState('');
  const [notes, setNotes] = useState('');

  const branchId = selectedBranch?.id;
  const isGM = user?.role === 'general_manager';

  const fetchData = useCallback(async () => {
    if (!branchId || selectedBranch?.isAllBranches) return;
    setIsLoading(true);
    try {
      const [transfersRes, balanceRes] = await Promise.all([
        fetch(`/api/reception/cash-management/transfers?branchId=${branchId}`),
        fetch(`/api/reception/cash-management/balance?branchId=${branchId}`),
      ]);

      if (transfersRes.ok) {
        const data = await transfersRes.json();
        setTransfers(data.data || []);
      }
      if (balanceRes.ok) {
        const data = await balanceRes.json();
        setBalance(data);
      }
    } catch {
      // Silent
    } finally {
      setIsLoading(false);
    }
  }, [branchId, selectedBranch?.isAllBranches]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleTransfer = async () => {
    if (!branchId) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reception/cash-management/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId,
          dividendAmount: parseFloat(dividendAmount) || 0,
          marketingAmount: parseFloat(marketingAmount) || 0,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }

      setShowForm(false);
      setDividendAmount('');
      setMarketingAmount('');
      setNotes('');
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/reception/cash-management" className="text-purple-600 hover:text-purple-800">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h2 className="text-xl font-bold text-gray-900">Safe Transfers</h2>
        </div>
        {isGM && (
          <Button onClick={() => setShowForm(true)}>
            Record Transfer
          </Button>
        )}
      </div>

      {/* GM Role Gate */}
      {!isGM && (
        <div className="flex items-center gap-3 p-4 bg-purple-50 border border-purple-200 rounded-xl">
          <Shield className="w-5 h-5 text-purple-600" />
          <p className="text-sm text-purple-700">
            Only the General Manager can record safe transfers.
          </p>
        </div>
      )}

      {/* Transfer Balance Preview */}
      {balance && (
        <Card>
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <p className="text-sm text-gray-500">Reception Safe</p>
              <p className="text-2xl font-bold text-purple-700">
                {formatCurrency(balance.allocation.dividend.available + balance.allocation.marketing.available)}
              </p>
              <p className="text-xs text-gray-400">Available for transfer</p>
            </div>
            <ArrowRight className="w-8 h-8 text-gray-300" />
            <div className="text-center">
              <p className="text-sm text-gray-500">Main Safe</p>
              <p className="text-2xl font-bold text-gray-400">—</p>
              <p className="text-xs text-gray-400">Collected by GM</p>
            </div>
          </div>
        </Card>
      )}

      {/* Transfer Form Modal */}
      {showForm && balance && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Record Safe Transfer</h3>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Dividend Amount (available: {formatCurrency(balance.allocation.dividend.available)})
              </label>
              <input
                type="number"
                value={dividendAmount}
                onChange={(e) => setDividendAmount(e.target.value)}
                className="mt-1 w-full border rounded-lg p-2"
                placeholder="0"
                max={balance.allocation.dividend.available}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Marketing Amount (available: {formatCurrency(balance.allocation.marketing.available)})
              </label>
              <input
                type="number"
                value={marketingAmount}
                onChange={(e) => setMarketingAmount(e.target.value)}
                className="mt-1 w-full border rounded-lg p-2"
                placeholder="0"
                max={balance.allocation.marketing.available}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="mt-1 w-full border rounded-lg p-2 text-sm"
                rows={2}
              />
            </div>

            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <div className="flex justify-between">
                <span>Total transfer:</span>
                <span className="font-bold">
                  {formatCurrency((parseFloat(dividendAmount) || 0) + (parseFloat(marketingAmount) || 0))}
                </span>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 text-sm text-gray-600"
              >
                Cancel
              </button>
              <Button
                onClick={handleTransfer}
                disabled={isSubmitting || ((parseFloat(dividendAmount) || 0) + (parseFloat(marketingAmount) || 0)) <= 0}
              >
                {isSubmitting ? 'Recording...' : 'Record Transfer'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer History */}
      <Card title="Transfer History" noPadding>
        {transfers.length === 0 ? (
          <p className="p-4 text-gray-500 text-center">No transfers recorded yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Dividend</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Marketing</th>
                  <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transfers.map((t) => (
                  <tr key={t.id}>
                    <td className="px-4 py-3">{new Date(t.transferDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-right text-purple-600">{formatCurrency(t.dividendAmount)}</td>
                    <td className="px-4 py-3 text-right text-pink-600">{formatCurrency(t.marketingAmount)}</td>
                    <td className="px-4 py-3 text-right font-semibold">{formatCurrency(t.totalAmount)}</td>
                    <td className="px-4 py-3 text-gray-500">{t.transferredByName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
