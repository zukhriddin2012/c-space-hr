'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/modules/reception/lib/constants';

interface TransactionSummaryFooterProps {
  branchId: string | null;
  dateFrom?: string;
  dateTo?: string;
  serviceTypeId?: string;
  paymentMethodId?: string;
  agentId?: string;
  refetchSignal?: number;
}

interface SummaryData {
  totalRevenue: number;
  count: number;
  cashTotal: number;
  digitalTotal: number;
  bankTotal: number;
}

export default function TransactionSummaryFooter({
  branchId, dateFrom, dateTo, serviceTypeId, paymentMethodId, agentId, refetchSignal,
}: TransactionSummaryFooterProps) {
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      const params = new URLSearchParams();
      if (branchId) params.set('branchId', branchId);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (serviceTypeId) params.set('serviceTypeId', serviceTypeId);
      if (paymentMethodId) params.set('paymentMethodId', paymentMethodId);
      if (agentId) params.set('agentId', agentId);

      try {
        const res = await fetch(`/api/reception/transactions/summary?${params}`);
        if (res.ok) setData(await res.json());
      } catch {
        // silent
      }
    }
    fetchSummary();
  }, [branchId, dateFrom, dateTo, serviceTypeId, paymentMethodId, agentId, refetchSignal]);

  if (!data || data.count === 0) return null;

  return (
    <div className="sticky bottom-0 z-10 bg-gradient-to-r from-purple-50 to-purple-100/80 border-t-2 border-purple-300 px-4 py-3 flex items-center gap-4 lg:gap-6 flex-wrap rounded-b-xl">
      <div>
        <div className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">Total Revenue</div>
        <div className="text-base lg:text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(data.totalRevenue)}</div>
      </div>
      <div className="w-px h-9 bg-purple-300" />
      <div>
        <div className="text-[10px] font-semibold text-purple-600 uppercase tracking-wider">Transactions</div>
        <div className="text-base lg:text-lg font-bold text-gray-900">{data.count}</div>
      </div>
      <div className="w-px h-9 bg-purple-300" />
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-md">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[11px] text-gray-500">Cash</span>
          <span className="text-xs font-semibold text-gray-900">{formatCurrency(data.cashTotal)}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-md">
          <div className="w-2 h-2 rounded-full bg-purple-500" />
          <span className="text-[11px] text-gray-500">Digital</span>
          <span className="text-xs font-semibold text-gray-900">{formatCurrency(data.digitalTotal)}</span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-md">
          <div className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-[11px] text-gray-500">Bank</span>
          <span className="text-xs font-semibold text-gray-900">{formatCurrency(data.bankTotal)}</span>
        </div>
      </div>
    </div>
  );
}
