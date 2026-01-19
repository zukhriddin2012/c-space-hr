'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Check,
  X,
  Clock,
  Building2,
  MapPin,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';

interface WageChangeRequest {
  id: string;
  employee_id: string;
  wage_type: 'primary' | 'additional';
  legal_entity_id: string | null;
  branch_id: string | null;
  current_amount: number;
  proposed_amount: number;
  change_type: 'increase' | 'decrease';
  reason: string;
  effective_date: string;
  status: string;
  created_at: string;
  approved_at: string | null;
  rejection_reason: string | null;
  employee?: { full_name: string; employee_id: string };
  requester?: { full_name: string };
  approver?: { full_name: string };
  legal_entity?: { name: string };
  branch?: { name: string };
}

function formatSalary(amount: number): string {
  if (!amount || amount === 0) return '0 UZS';
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    pending: { label: 'Pending', className: 'bg-amber-50 text-amber-700', icon: <Clock size={14} /> },
    approved: { label: 'Approved', className: 'bg-green-50 text-green-700', icon: <CheckCircle size={14} /> },
    rejected: { label: 'Rejected', className: 'bg-red-50 text-red-700', icon: <XCircle size={14} /> },
    cancelled: { label: 'Cancelled', className: 'bg-gray-50 text-gray-600', icon: <X size={14} /> },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.className}`}>
      {config.icon}
      {config.label}
    </span>
  );
}

export default function WageChangeRequestsPage() {
  const [requests, setRequests] = useState<WageChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingRequest, setRejectingRequest] = useState<WageChangeRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const statusParam = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`/api/wage-change-requests${statusParam}`);

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch requests');
      }

      const data = await response.json();
      setRequests(data.requests || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    setError(null);

    try {
      const response = await fetch(`/api/wage-change-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to approve request');
      }

      setSuccess('Wage change approved successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectingRequest || !rejectionReason) return;

    setProcessingId(rejectingRequest.id);
    setError(null);

    try {
      const response = await fetch(`/api/wage-change-requests/${rejectingRequest.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejection_reason: rejectionReason }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to reject request');
      }

      setSuccess('Wage change request rejected.');
      setTimeout(() => setSuccess(null), 3000);
      setShowRejectModal(false);
      setRejectingRequest(null);
      setRejectionReason('');
      fetchRequests();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject request');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (request: WageChangeRequest) => {
    setRejectingRequest(request);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Wage Change Requests</h1>
            <p className="text-gray-500 mt-1">Review and approve employee wage changes</p>
          </div>
        </div>
        {pendingCount > 0 && filter !== 'pending' && (
          <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-lg text-sm font-medium">
            {pendingCount} pending request{pendingCount > 1 ? 's' : ''}
          </div>
        )}
      </div>

      {/* Messages */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-700">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-600">
            <X size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 text-green-700">
          <CheckCircle size={20} />
          <span>{success}</span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'all', 'approved', 'rejected'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'pending' && pendingCount > 0 && (
              <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Requests list */}
      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Loader2 size={32} className="mx-auto text-gray-400 animate-spin" />
          <p className="text-gray-500 mt-3">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Clock size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">
            {filter === 'pending'
              ? 'No pending wage change requests'
              : `No ${filter === 'all' ? '' : filter + ' '}requests found`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <User size={24} className="text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.employee?.full_name || 'Unknown Employee'}
                    </h3>
                    <p className="text-sm text-gray-500">{request.employee?.employee_id}</p>
                  </div>
                </div>
                <StatusBadge status={request.status} />
              </div>

              {/* Wage change details */}
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {request.wage_type === 'primary' ? (
                      <Building2 size={16} className="text-indigo-500" />
                    ) : (
                      <MapPin size={16} className="text-emerald-500" />
                    )}
                    <span className="text-sm text-gray-600">
                      {request.wage_type === 'primary' ? 'Primary Wage' : 'Additional Wage'}
                    </span>
                  </div>
                  <p className="font-medium text-gray-900">
                    {request.wage_type === 'primary'
                      ? request.legal_entity?.name || request.legal_entity_id
                      : request.branch?.name || request.branch_id}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {request.change_type === 'increase' ? (
                      <ArrowUpCircle size={16} className="text-green-500" />
                    ) : (
                      <ArrowDownCircle size={16} className="text-red-500" />
                    )}
                    <span className="text-sm text-gray-600">
                      Wage {request.change_type === 'increase' ? 'Increase' : 'Decrease'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{formatSalary(request.current_amount)}</span>
                    <span className="text-gray-400">→</span>
                    <span className={`font-semibold ${
                      request.change_type === 'increase' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatSalary(request.proposed_amount)}
                    </span>
                  </div>
                  <p className={`text-xs mt-1 ${
                    request.change_type === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {request.change_type === 'increase' ? '+' : '-'}
                    {formatSalary(Math.abs(request.proposed_amount - request.current_amount))} (
                    {Math.round(Math.abs((request.proposed_amount - request.current_amount) / request.current_amount * 100))}%)
                  </p>
                </div>
              </div>

              {/* Reason & dates */}
              <div className="space-y-2 mb-4">
                <div>
                  <span className="text-sm text-gray-500">Reason: </span>
                  <span className="text-sm text-gray-900">{request.reason}</span>
                </div>
                <div className="flex gap-6 text-sm text-gray-500">
                  <span>Effective Date: <span className="text-gray-900">{formatDate(request.effective_date)}</span></span>
                  <span>Requested: <span className="text-gray-900">{formatDate(request.created_at)}</span></span>
                  <span>By: <span className="text-gray-900">{request.requester?.full_name || 'Unknown'}</span></span>
                </div>
              </div>

              {/* Rejection reason if rejected */}
              {request.status === 'rejected' && request.rejection_reason && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <p className="text-sm text-red-700">
                    <strong>Rejection Reason:</strong> {request.rejection_reason}
                  </p>
                  {request.approver && (
                    <p className="text-xs text-red-500 mt-1">
                      Rejected by {request.approver.full_name} on {formatDate(request.approved_at || '')}
                    </p>
                  )}
                </div>
              )}

              {/* Approval info if approved */}
              {request.status === 'approved' && request.approver && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
                  <p className="text-sm text-green-700">
                    Approved by {request.approver.full_name} on {formatDate(request.approved_at || '')}
                  </p>
                </div>
              )}

              {/* Actions for pending requests */}
              {request.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => openRejectModal(request)}
                    disabled={processingId === request.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
                  >
                    <X size={18} />
                    Reject
                  </button>
                  <button
                    onClick={() => handleApprove(request.id)}
                    disabled={processingId === request.id}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                  >
                    {processingId === request.id ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Check size={18} />
                    )}
                    Approve
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && rejectingRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <X size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Reject Wage Change</h3>
                <p className="text-sm text-gray-500">
                  {rejectingRequest.employee?.full_name}
                </p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {rejectingRequest.change_type === 'increase' ? 'Increase' : 'Decrease'} from{' '}
                {formatSalary(rejectingRequest.current_amount)} to{' '}
                {formatSalary(rejectingRequest.proposed_amount)}
              </p>
              <p className="text-xs text-gray-500 mt-1">Reason: {rejectingRequest.reason}</p>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="Provide a reason for rejecting this request..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none resize-none"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectingRequest(null);
                  setRejectionReason('');
                }}
                disabled={processingId !== null}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReject}
                disabled={!rejectionReason || processingId !== null}
                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processingId ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
