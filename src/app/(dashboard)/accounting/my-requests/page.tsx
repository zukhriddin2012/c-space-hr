'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/contexts/LanguageContext';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import {
  getStatusColor,
  getRequestTypeColor,
  getPriorityColor,
  formatCurrency,
  formatRelativeTime,
  getSlaStatus,
  getSlaRemainingText,
  getSlaColor,
  transformRequestListItem,
} from '@/modules/accounting/lib/utils';
import type { AccountingRequest, AccountingRequestStatus, AccountingRequestType } from '@/modules/accounting/types';

export default function MyAccountingRequestsPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState<AccountingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<AccountingRequestStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<AccountingRequestType | ''>('');

  const canCreate = user && hasPermission(user.role, PERMISSIONS.ACCOUNTING_REQUESTS_CREATE);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, typeFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('requestType', typeFilter);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`/api/accounting/requests?${params}`);
      if (!response.ok) throw new Error('Failed to fetch requests');

      const data = await response.json();
      const transformed = (data.data || []).map((r: Record<string, unknown>) => transformRequestListItem(r));
      setRequests(transformed as AccountingRequest[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.errors.generic);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRequests();
  };

  // Helper for status labels
  const getStatusLabelTranslated = (status: AccountingRequestStatus) => {
    const statusMap: Record<AccountingRequestStatus, string> = {
      pending: t.accounting.pending,
      in_progress: t.accounting.inProgress,
      needs_info: t.accounting.needsInfo,
      pending_approval: t.accounting.pendingApproval,
      approved: t.accounting.approved,
      completed: t.accounting.completed,
      rejected: t.accounting.rejected,
      cancelled: t.accounting.cancelled,
    };
    return statusMap[status] || status;
  };

  // Helper for type labels
  const getTypeLabelTranslated = (type: AccountingRequestType) => {
    const typeMap: Record<AccountingRequestType, string> = {
      reconciliation: t.accounting.reconciliation,
      payment: t.accounting.payment,
      confirmation: t.accounting.confirmation,
    };
    return typeMap[type] || type;
  };

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t.accounting.myRequests}</h1>
          <p className="text-gray-500 mt-1">{t.common.view} {t.accounting.myRequests.toLowerCase()}</p>
        </div>
        {canCreate && (
          <Link
            href="/accounting/requests/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            {t.accounting.newRequest}
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder={`${t.common.search}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as AccountingRequestStatus | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">{t.common.all} {t.common.status}</option>
            <option value="pending">{t.accounting.pending}</option>
            <option value="in_progress">{t.accounting.inProgress}</option>
            <option value="needs_info">{t.accounting.needsInfo}</option>
            <option value="pending_approval">{t.accounting.pendingApproval}</option>
            <option value="completed">{t.accounting.completed}</option>
            <option value="rejected">{t.accounting.rejected}</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as AccountingRequestType | '')}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
          >
            <option value="">{t.common.all} {t.accounting.requestType}</option>
            <option value="reconciliation">{t.accounting.reconciliation}</option>
            <option value="payment">{t.accounting.payment}</option>
            <option value="confirmation">{t.accounting.confirmation}</option>
          </select>

          <button
            type="button"
            onClick={fetchRequests}
            className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
            title={t.common.refresh}
          >
            <RefreshCw size={20} />
          </button>
        </form>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-600">{error}</div>
        ) : requests.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p>{t.accounting.noRequests}</p>
            {canCreate && (
              <Link
                href="/accounting/requests/new"
                className="inline-flex items-center gap-2 mt-4 text-purple-600 hover:text-purple-700"
              >
                <Plus size={16} />
                {t.accounting.createFirst}
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.accounting.requestNumber}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.accounting.requestType}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.common.status}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.accounting.amount}
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SLA
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t.accounting.createdAt}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {requests.map((request) => {
                  const slaStatus = getSlaStatus(request.slaDeadline || null, request.status);
                  return (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <Link
                          href={`/accounting/requests/${request.id}`}
                          className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                          {request.requestNumber}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1 truncate max-w-xs">
                          {request.title}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getRequestTypeColor(request.requestType)}`}>
                          {getTypeLabelTranslated(request.requestType)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(request.status)}`}>
                          {getStatusLabelTranslated(request.status)}
                        </span>
                        {request.priority === 'urgent' && (
                          <span className={`ml-2 inline-flex px-2 py-1 text-xs font-medium rounded-full border ${getPriorityColor('urgent')}`}>
                            {t.accounting.urgent}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {request.amount ? formatCurrency(request.amount) : '-'}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-sm ${getSlaColor(slaStatus)}`}>
                          {getSlaRemainingText(request.slaDeadline || null)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatRelativeTime(request.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
