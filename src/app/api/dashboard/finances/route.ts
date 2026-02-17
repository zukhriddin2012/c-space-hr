import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { validateBranchAccess } from '@/lib/security';
import {
  getFinancialAggregations,
  getRevenueByServiceType,
  getExpensesByCategory,
  getRevenueByPaymentMethod,
  getPaymentMethodsByBranch,
} from '@/lib/db/finance-dashboard';
import { getDealForPeriod } from '@/lib/db/branch-profit-deals';
import type {
  FinanceDashboardResponse,
  BranchFinancials,
  TrendDirection,
  PeriodTotals,
  BreakdownItem,
  PaymentMethodBreakdown,
} from '@/modules/finance-dashboard/types';

// ============================================
// GET /api/dashboard/finances
// Finance dashboard with totals, splits, breakdowns, comparison
// ============================================
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const requestedBranchId = searchParams.get('branchId');

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'startDate and endDate are required' },
        { status: 400 }
      );
    }

    // Branch access scoping
    const branchAccess = await validateBranchAccess(
      user,
      requestedBranchId,
      PERMISSIONS.FINANCES_VIEW_ALL
    );
    if (branchAccess.error) {
      return NextResponse.json({ error: branchAccess.error }, { status: branchAccess.status });
    }
    const branchId = branchAccess.branchId;

    // Calculate previous period (same duration, shifted back)
    const { prevStart, prevEnd } = calculatePreviousPeriod(startDate, endDate);

    // Fetch data in parallel
    const [
      currentAggregations,
      previousAggregations,
      serviceBreakdown,
      expenseBreakdown,
      paymentMethodBreakdown,
      paymentMethodsByBranch,
    ] = await Promise.all([
      getFinancialAggregations(startDate, endDate, branchId),
      getFinancialAggregations(prevStart, prevEnd, branchId),
      getRevenueByServiceType(startDate, endDate, branchId),
      getExpensesByCategory(startDate, endDate, branchId),
      getRevenueByPaymentMethod(startDate, endDate, branchId),
      getPaymentMethodsByBranch(startDate, endDate, branchId),
    ]);

    // Build branch financials with profit splits
    const branches: BranchFinancials[] = [];
    let totalRevenue = 0, totalExpenses = 0, totalCspaceProfit = 0, totalInvestorPayouts = 0;

    for (const agg of currentAggregations) {
      const netProfit = agg.total_revenue - agg.total_expenses;
      const deal = await getDealForPeriod(agg.branch_id, startDate, endDate);
      const split = calculateProfitSplit(netProfit, deal);

      // Find previous period data for this branch
      const prevAgg = previousAggregations.find(p => p.branch_id === agg.branch_id);
      const prevNetProfit = prevAgg ? prevAgg.total_revenue - prevAgg.total_expenses : 0;
      const trend = calculateDelta(netProfit, prevNetProfit);

      branches.push({
        branchId: agg.branch_id,
        branchName: agg.branch_name,
        investorName: deal?.investor_name || 'No deal configured',
        revenue: agg.total_revenue,
        expenses: agg.total_expenses,
        netProfit,
        cspacePercentage: split.cspacePercentage,
        investorPercentage: split.investorPercentage,
        cspaceShare: split.cspaceShare,
        investorShare: split.investorShare,
        transactionCount: agg.transaction_count,
        expenseCount: agg.expense_count,
        trend: {
          percentage: trend.percentage,
          direction: trend.trend,
        },
      });

      totalRevenue += agg.total_revenue;
      totalExpenses += agg.total_expenses;
      totalCspaceProfit += split.cspaceShare;
      totalInvestorPayouts += split.investorShare;
    }

    const totalNetProfit = totalRevenue - totalExpenses;

    // Calculate previous period totals
    let prevTotalRevenue = 0, prevTotalExpenses = 0, prevTotalCspace = 0, prevTotalInvestor = 0;
    for (const prevAgg of previousAggregations) {
      const prevNet = prevAgg.total_revenue - prevAgg.total_expenses;
      const prevDeal = await getDealForPeriod(prevAgg.branch_id, prevStart, prevEnd);
      const prevSplit = calculateProfitSplit(prevNet, prevDeal);
      prevTotalRevenue += prevAgg.total_revenue;
      prevTotalExpenses += prevAgg.total_expenses;
      prevTotalCspace += prevSplit.cspaceShare;
      prevTotalInvestor += prevSplit.investorShare;
    }
    const prevTotalNetProfit = prevTotalRevenue - prevTotalExpenses;

    const current: PeriodTotals = {
      totalRevenue,
      totalExpenses,
      netProfit: totalNetProfit,
      cspaceProfit: totalCspaceProfit,
      investorPayouts: totalInvestorPayouts,
    };
    const previous: PeriodTotals = {
      totalRevenue: prevTotalRevenue,
      totalExpenses: prevTotalExpenses,
      netProfit: prevTotalNetProfit,
      cspaceProfit: prevTotalCspace,
      investorPayouts: prevTotalInvestor,
    };

    // Build breakdowns with percentages
    const totalServiceRevenue = serviceBreakdown.reduce((s, b) => s + b.total_amount, 0);
    const totalExpenseAmount = expenseBreakdown.reduce((s, b) => s + b.total_amount, 0);
    const totalPaymentAmount = paymentMethodBreakdown.reduce((s, b) => s + b.total_amount, 0);

    const revenueByServiceType: BreakdownItem[] = serviceBreakdown.map(b => ({
      id: b.service_type_id,
      name: b.service_type_name,
      icon: b.service_type_icon || undefined,
      amount: b.total_amount,
      count: b.count,
      percentage: totalServiceRevenue > 0 ? Math.round(b.total_amount / totalServiceRevenue * 1000) / 10 : 0,
    }));

    const expensesByCategory: BreakdownItem[] = expenseBreakdown.map(b => ({
      id: b.expense_type_id,
      name: b.expense_type_name,
      icon: b.expense_type_icon || undefined,
      amount: b.total_amount,
      count: b.count,
      percentage: totalExpenseAmount > 0 ? Math.round(b.total_amount / totalExpenseAmount * 1000) / 10 : 0,
    }));

    const revenueByPaymentMethod: BreakdownItem[] = paymentMethodBreakdown.map(b => ({
      id: b.payment_method_id,
      name: b.payment_method_name,
      amount: b.total_amount,
      count: b.count,
      percentage: totalPaymentAmount > 0 ? Math.round(b.total_amount / totalPaymentAmount * 1000) / 10 : 0,
    }));

    const paymentMethodsByBranchResult: PaymentMethodBreakdown[] = paymentMethodsByBranch.map(b => {
      const branchTotal = b.methods.reduce((s, m) => s + m.amount, 0);
      return {
        branchId: b.branchId,
        branchName: b.branchName,
        methods: b.methods.map(m => ({
          id: m.id,
          name: m.name,
          amount: m.amount,
          percentage: branchTotal > 0 ? Math.round(m.amount / branchTotal * 1000) / 10 : 0,
        })),
      };
    });

    const response: FinanceDashboardResponse = {
      period: { startDate, endDate },
      comparison: {
        current,
        previous,
        deltas: {
          revenue: calculateDelta(current.totalRevenue, previous.totalRevenue),
          expenses: calculateDelta(current.totalExpenses, previous.totalExpenses),
          netProfit: calculateDelta(current.netProfit, previous.netProfit),
          cspaceProfit: calculateDelta(current.cspaceProfit, previous.cspaceProfit),
          investorPayouts: calculateDelta(current.investorPayouts, previous.investorPayouts),
        },
      },
      branches,
      breakdowns: {
        revenueByServiceType,
        expensesByCategory,
        revenueByPaymentMethod,
        paymentMethodsByBranch: paymentMethodsByBranchResult,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching finance dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { permission: PERMISSIONS.FINANCES_VIEW });

// ============================================
// HELPER FUNCTIONS
// ============================================

function calculatePreviousPeriod(startDate: string, endDate: string): { prevStart: string; prevEnd: string } {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const durationMs = end.getTime() - start.getTime();

  const prevEnd = new Date(start.getTime() - 86400000); // day before current start
  const prevStart = new Date(prevEnd.getTime() - durationMs);

  return {
    prevStart: prevStart.toISOString().split('T')[0],
    prevEnd: prevEnd.toISOString().split('T')[0],
  };
}

function calculateDelta(current: number, previous: number): { percentage: number; trend: TrendDirection } {
  if (previous === 0) {
    return { percentage: current > 0 ? 100 : 0, trend: current > 0 ? 'up' : 'flat' };
  }
  const percentage = ((current - previous) / Math.abs(previous)) * 100;
  const trend: TrendDirection = percentage > 1 ? 'up' : percentage < -1 ? 'down' : 'flat';
  return { percentage: Math.round(percentage * 10) / 10, trend };
}

function calculateProfitSplit(
  netProfit: number,
  deal: { cspace_percentage: number; investor_percentage: number; investor_name: string } | null
): { cspaceShare: number; investorShare: number; cspacePercentage: number; investorPercentage: number } {
  if (!deal) {
    return { cspaceShare: 0, investorShare: 0, cspacePercentage: 0, investorPercentage: 0 };
  }
  const cspaceShare = Math.round(netProfit * Number(deal.cspace_percentage) / 100);
  const investorShare = Math.round(netProfit * Number(deal.investor_percentage) / 100);
  return {
    cspaceShare,
    investorShare,
    cspacePercentage: Number(deal.cspace_percentage),
    investorPercentage: Number(deal.investor_percentage),
  };
}
