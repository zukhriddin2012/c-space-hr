'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import Link from 'next/link';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/modules/reception/lib/constants';
import { useReceptionMode } from '@/contexts/ReceptionModeContext';
import { useAuth } from '@/contexts/AuthContext';
import type { DividendSpendRequest, DividendSpendStatus, CashAllocationBalance } from '@/modules/reception/types';

export default function DividendRequestsPage() {
  const { selectedBranch } = useReceptionMode();
  const { user } = useAuth();
  const [requests, setRequests] = useState<DividendSpendRequest[]>([]);
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 });
  const [balance, setBalance] = useState<CashAllocationBalance | null>(null);
  const [expenseTypes, setExpenseTypes] = useState<{ id: string; name: string }[]>([]);
  const [activeFilter, setActiveFilter] = useState<DividendSpendStatus | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewNote, setReviewNote] = useState('');

  // Form state
  const [formSubject, setFormSubject] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formTypeId, setFormTypeId] = useState('');
  const [formReason, setFormReason] = useState('');

  const branchId = selectedBranch?.id;
  const isGM = user?.role === 'general_manager';

  const fetchData = useCallback(async () => {
    if (!branchId || selectedBranch?.isAllBranches) return;
    setIsLoading(true);
    try {
      const statusParam = activeFilter !== 'all' ? `&status=${activeFilter}` : '';
      const [reqRes, balRes, typesRes] = await Promise.all([
        fetch(`/api/reception/cash-management/dividend-requests?branchId=${branchId}${statusParam}`),
        fetch(`/api/reception/cash-management/balance?branchId=${branchId}`),
        fetch(`/api/reception/admin/expense-types?activeOnly=true`),
      ]);

      if (reqRes.ok) {
        const data = await reqRes.json();
        setRequests(data.data || []);
        setCounts(data.counts || { pending: 0, approved: 0, rejected: 0 });
      }
      if (balRes.ok) setBalance(await balRes.json());
      if (typesRes.ok) {
        const data = await typesRes.json();
        setExpenseTypes(Array.isArray(data) ? data : data.data || []);
      }
    } catch {
      // Silent
    } finally {
      setIsLoading(false);
    }
  }, [branchId, selectedBranch?.isAllBranches, activeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async () => {
    if (!branchId || !balance) return;
    setIsSubmitting(true);
    try {
      const amount = parseFloat(formAmount) || 0;
      const opexAvailable = balance.allocation.opex.available;
      const opexPortion = Math.min(opexAvailable, amount);
      const dividendPortion = amount - opexPortion;

      const res = await fetch('/api/reception/cash-management/dividend-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          branchId,
          expenseSubject: formSubject.trim(),
          expenseAmount: amount,
          expenseTypeId: formTypeId,
          opexPortion,
          dividendPortion,
          reason: formReason.trim(),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }

      setShowCreateForm(false);
      setFormSubject('');
      setFormAmount('');
      setFormTypeId('');
      setFormReason('');
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReview = async (requestId: string, action: 'approve' | 'reject') => {
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/reception/cash-management/dividend-requests', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action, reviewNote: reviewNote.trim() || undefined }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed');
      }

      setReviewingId(null);
      setReviewNote('');
      await fetchData();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusIcon = (status: DividendSpendStatus) => {
    if (status === 'approved') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'rejected') return <XCircle className="w-4 h-4 text-red-500" />;
    return <Clock className="w-4 h-4 text-amber-500" />;
  };

  const statusColor = (status: DividendSpendStatus) => {
    if (status === 'approved') return 'bg-green-100 text-green-700';
    if (status === 'rejected') return 'bg-red-100 text-red-700';
    return 'bg-amber-100 text-amber-700';
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
          <h2 className="text-xl font-bold text-gray-900">Dividend Spend Requests</h2>
        </div>
        <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          New Request
        </Button>
      </div>

      {/* Status Filter */}
      <div className="flex gap-2">
        {(['all', 'pending', 'approved', 'rejected'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === filter
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filter.charAt(0).toUpperCase() + filter.slice(1)}
            {filter !== 'all' && (
              <span className="ml-1 text-xs">
                ({counts[filter as DividendSpendStatus] || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Request Cards */}
      {requests.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500">No requests found</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req.id}>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {statusIcon(req.status)}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(req.status)}`}>
                      {req.status}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900">{req.expenseSubject}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {req.expenseTypeName} &middot; {req.requestedByName} &middot; {new Date(req.requestedAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600 mt-2 italic">&ldquo;{req.reason}&rdquo;</p>

                  <div className="flex gap-4 mt-3 text-xs text-gray-500">
                    <span>Total: <strong className="text-gray-700">{formatCurrency(req.expenseAmount)}</strong></span>
                    <span>OpEx: <strong className="text-amber-600">{formatCurrency(req.opexPortion)}</strong></span>
                    <span>Dividend: <strong className="text-purple-600">{formatCurrency(req.dividendPortion)}</strong></span>
                  </div>

                  {req.reviewNote && (
                    <p className="text-xs text-gray-500 mt-2 bg-gray-50 p-2 rounded">
                      Review: {req.reviewNote}
                    </p>
                  )}
                </div>

                {/* Approval Buttons (GM only, pending only) */}
                {isGM && req.status === 'pending' && (
                  <div className="flex flex-col gap-2 ml-4">
                    {reviewingId === req.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          className="w-40 border rounded p-1 text-xs"
                          placeholder="Note (optional)"
                          rows={2}
                        />
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleReview(req.id, 'approve')}
                            disabled={isSubmitting}
                            className="flex-1 px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReview(req.id, 'reject')}
                            disabled={isSubmitting}
                            className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </div>
                        <button
                          onClick={() => { setReviewingId(null); setReviewNote(''); }}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReviewingId(req.id)}
                        className="px-3 py-1.5 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 font-medium"
                      >
                        Review
                      </button>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Form Modal */}
      {showCreateForm && balance && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Request Dividend Spend</h3>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
              <p className="text-amber-700">
                OpEx available: <strong>{formatCurrency(balance.allocation.opex.available)}</strong>
                {' '}&middot;{' '}
                Dividend available: <strong>{formatCurrency(balance.allocation.dividend.available)}</strong>
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                value={formSubject}
                onChange={(e) => setFormSubject(e.target.value)}
                className="mt-1 w-full border rounded-lg p-2"
                placeholder="What is this expense for?"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Amount (UZS)</label>
              <input
                type="number"
                value={formAmount}
                onChange={(e) => setFormAmount(e.target.value)}
                className="mt-1 w-full border rounded-lg p-2"
                placeholder="0"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Expense Type</label>
              <select
                value={formTypeId}
                onChange={(e) => setFormTypeId(e.target.value)}
                className="mt-1 w-full border rounded-lg p-2"
              >
                <option value="">Select type...</option>
                {expenseTypes.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Reason for dividend spend</label>
              <textarea
                value={formReason}
                onChange={(e) => setFormReason(e.target.value)}
                className="mt-1 w-full border rounded-lg p-2 text-sm"
                rows={2}
                placeholder="Why is this expense needed and why can't it be covered by OpEx alone?"
              />
            </div>

            {/* Funding breakdown preview */}
            {parseFloat(formAmount) > 0 && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span>From OpEx:</span>
                  <span className="font-medium text-amber-600">
                    {formatCurrency(Math.min(balance.allocation.opex.available, parseFloat(formAmount) || 0))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>From Dividend (needs approval):</span>
                  <span className="font-medium text-purple-600">
                    {formatCurrency(Math.max(0, (parseFloat(formAmount) || 0) - balance.allocation.opex.available))}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 text-sm text-gray-600"
              >
                Cancel
              </button>
              <Button
                onClick={handleCreate}
                disabled={isSubmitting || !formSubject.trim() || !formAmount || !formTypeId || !formReason.trim()}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
