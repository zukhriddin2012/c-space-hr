'use client';

import { useState } from 'react';
import { Wallet, Download, CheckCircle, X, Loader2 } from 'lucide-react';

interface PayrollRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  employee_position: string;
  legal_entity: string;
  month: number;
  year: number;
  gross_salary: number;
  bonuses: number;
  deductions: number;
  net_salary: number;
  status: 'draft' | 'approved' | 'paid';
  payment_date: string | null;
}

interface PayrollActionsProps {
  payroll: PayrollRecord[];
  year: number;
  month: number;
  canProcess: boolean;
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

function getMonthName(month: number, year: number) {
  return new Date(year, month - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default function PayrollActions({ payroll, year, month, canProcess }: PayrollActionsProps) {
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleExport = () => {
    if (payroll.length === 0) {
      alert('No payroll data to export');
      return;
    }

    // Create CSV content
    const headers = ['Employee', 'Position', 'Legal Entity', 'Gross (UZS)', 'Tax 12% (UZS)', 'Net Payable (UZS)', 'Status', 'Payment Date'];
    const rows = payroll.map(record => [
      record.employee_name,
      record.employee_position,
      record.legal_entity,
      record.gross_salary.toString(),
      record.deductions.toString(),
      record.net_salary.toString(),
      record.status,
      record.payment_date || '-',
    ]);

    // Add totals row
    const totalGross = payroll.reduce((sum, p) => sum + p.gross_salary, 0);
    const totalDeductions = payroll.reduce((sum, p) => sum + p.deductions, 0);
    const totalNet = payroll.reduce((sum, p) => sum + p.net_salary, 0);
    rows.push(['', '', 'TOTAL', totalGross.toString(), totalDeductions.toString(), totalNet.toString(), '', '']);

    const csvContent = [
      `Payroll Report - ${getMonthName(month, year)}`,
      '',
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `payroll-${year}-${String(month).padStart(2, '0')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleProcessPayroll = async () => {
    setProcessing(true);
    setProcessResult(null);

    try {
      const response = await fetch('/api/payroll/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ year, month }),
      });

      const data = await response.json();

      if (response.ok) {
        setProcessResult({ success: true, message: data.message || 'Payroll processed successfully!' });
        // Refresh the page after a short delay
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else {
        setProcessResult({ success: false, message: data.error || 'Failed to process payroll' });
      }
    } catch (error) {
      setProcessResult({ success: false, message: 'An error occurred while processing payroll' });
    } finally {
      setProcessing(false);
    }
  };

  const draftCount = payroll.filter(p => p.status === 'draft').length;
  const approvedCount = payroll.filter(p => p.status === 'approved').length;

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          <Download size={20} />
          Export
        </button>
        {canProcess && (
          <button
            onClick={() => setShowProcessModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <Wallet size={20} />
            Process Payroll
          </button>
        )}
      </div>

      {/* Process Payroll Modal */}
      {showProcessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Process Payroll</h3>
              <button
                onClick={() => {
                  setShowProcessModal(false);
                  setProcessResult(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {processResult ? (
                <div className={`flex items-center gap-3 p-4 rounded-lg ${processResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
                  {processResult.success ? (
                    <CheckCircle className="text-green-600" size={24} />
                  ) : (
                    <X className="text-red-600" size={24} />
                  )}
                  <p className={processResult.success ? 'text-green-700' : 'text-red-700'}>
                    {processResult.message}
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-4">
                    Process payroll for <strong>{getMonthName(month, year)}</strong>?
                  </p>

                  <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Records:</span>
                      <span className="font-medium">{payroll.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Draft (will be approved):</span>
                      <span className="font-medium text-yellow-600">{draftCount}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Approved (will be paid):</span>
                      <span className="font-medium text-blue-600">{approvedCount}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                      <span className="text-gray-500">Total Net Payable:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(payroll.reduce((sum, p) => sum + p.net_salary, 0))}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-500">
                    This will update all draft records to approved, and all approved records to paid with today&apos;s date.
                  </p>
                </>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setShowProcessModal(false);
                  setProcessResult(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {processResult ? 'Close' : 'Cancel'}
              </button>
              {!processResult && (
                <button
                  onClick={handleProcessPayroll}
                  disabled={processing || payroll.length === 0}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Confirm & Process
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
