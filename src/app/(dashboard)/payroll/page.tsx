import { getSession } from '@/lib/auth-server';
import { hasPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getPayrollByMonth, getPayrollStats, getPaymentRequestsSummary, getPaidAdvancesByEmployee } from '@/lib/db';
import PayrollFilters from './PayrollFilters';
import PayrollActions from './PayrollActions';
import PaymentRequestsSection from './PaymentRequestsSection';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

function getMonthName(month: number, year: number) {
  return new Date(year, month - 1).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export default async function PayrollPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string; status?: string }>;
}) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Check permission
  if (!hasPermission(user.role, 'view_wages')) {
    redirect('/dashboard');
  }

  const canProcessPayroll = hasPermission(user.role, 'process_payroll');
  const canApprovePayroll = hasPermission(user.role, 'approve_payroll');

  // Get filter params
  const params = await searchParams;
  const currentDate = new Date();
  const selectedYear = parseInt(params.year || String(currentDate.getFullYear()));
  const selectedMonth = parseInt(params.month || String(currentDate.getMonth() + 1));
  const selectedStatus = params.status || '';

  // Fetch payroll data from database
  const [payroll, stats, paymentRequestsSummary, paidAdvances] = await Promise.all([
    getPayrollByMonth(selectedYear, selectedMonth),
    getPayrollStats(selectedYear, selectedMonth),
    getPaymentRequestsSummary(selectedYear, selectedMonth),
    getPaidAdvancesByEmployee(selectedYear, selectedMonth),
  ]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payroll</h1>
          <p className="text-gray-500 mt-1">
            Manage employee wages and payment processing for {getMonthName(selectedMonth, selectedYear)}
          </p>
        </div>
        <PayrollActions
          payroll={payroll}
          year={selectedYear}
          month={selectedMonth}
          canProcess={canProcessPayroll}
        />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Gross</p>
          <p className="text-xl font-semibold text-gray-900">
            {formatCurrency(stats.totalGross)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{stats.totalEmployees} employees</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Deductions</p>
          <p className="text-xl font-semibold text-red-600">
            -{formatCurrency(stats.totalDeductions)}
          </p>
          <p className="text-xs text-gray-400 mt-1">~12% tax rate</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Total Net Payable</p>
          <p className="text-xl font-semibold text-green-600">
            {formatCurrency(stats.totalNet)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-sm text-gray-500 mb-1">Payment Status</p>
          <div className="flex items-center gap-4 mt-1">
            <span className="text-sm">
              <span className="font-semibold text-green-600">{stats.paid}</span> Paid
            </span>
            <span className="text-sm">
              <span className="font-semibold text-blue-600">{stats.approved}</span> Approved
            </span>
            <span className="text-sm">
              <span className="font-semibold text-yellow-600">{stats.draft}</span> Draft
            </span>
          </div>
        </div>
      </div>

      {/* Payment Requests Section */}
      <PaymentRequestsSection
        year={selectedYear}
        month={selectedMonth}
        payroll={payroll}
        summary={paymentRequestsSummary}
        paidAdvances={paidAdvances}
        canProcess={canProcessPayroll}
        canApprove={canApprovePayroll}
      />

      {/* Filters */}
      <PayrollFilters
        currentYear={selectedYear}
        currentMonth={selectedMonth}
        currentStatus={selectedStatus}
      />
    </div>
  );
}
