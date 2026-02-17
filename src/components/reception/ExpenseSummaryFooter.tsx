'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/modules/reception/lib/constants';

interface ExpenseSummaryFooterProps {
  branchId: string | null;
  dateFrom?: string;
  dateTo?: string;
  expenseTypeId?: string;
  paymentMethod?: string;
  recordedBy?: string;
  refetchSignal?: number;
}

interface SummaryData {
  totalExpenses: number;
  count: number;
  cashTotal: number;
  bankTotal: number;
}

export default function ExpenseSummaryFooter({
  branchId, dateFrom, dateTo, expenseTypeId, paymentMethod, recordedBy, refetchSignal,
}: ExpenseSummaryFooterProps) {
  const [data, setData] = useState<SummaryData | null>(null);

  useEffect(() => {
    async function fetchSummary() {
      const params = new URLSearchParams();
      if (branchId) params.set('branchId', branchId);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      if (expenseTypeId) params.set('expenseTypeId', expenseTypeId);
      if (paymentMethod) params.set('paymentMethod', paymentMethod);
      if (recordedBy) params.set('recordedBy', recordedBy);

      try {
        const res = await fetch(`/api/reception/expenses/summary?${params}`);
        if (res.ok) setData(await res.json());
      } catch {
        // silent
      }
    }
    fetchSummary();
  }, [branchId, dateFrom, dateTo, expenseTypeId, paymentMethod, recordedBy, refetchSignal]);

  if (!data || data.count === 0) return null;

  return (
    <div className="sticky bottom-0 z-10 bg-gradient-to-r from-red-50 to-red-100/80 border-t-2 border-red-300 px-4 py-3 flex items-center gap-4 lg:gap-6 flex-wrap rounded-b-xl">
      <div>
        <div className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">Total Expenses</div>
        <div className="text-base lg:text-lg font-bold text-gray-900 tabular-nums">{formatCurrency(data.totalExpenses)}</div>
      </div>
      <div className="w-px h-9 bg-red-300" />
      <div>
        <div className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">Expenses</div>
        <div className="text-base lg:text-lg font-bold text-gray-900">{data.count}</div>
      </div>
      <div className="w-px h-9 bg-red-300" />
      <div className="flex gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-gray-200 rounded-md">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-[11px] text-gray-500">Cash</span>
          <span className="text-xs font-semibold text-gray-900">{formatCurrency(data.cashTotal)}</span>
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
