import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { validateBranchAccess } from '@/lib/security';
import { getExpenseSummaryTotals } from '@/lib/db/finance-dashboard';

// ============================================
// GET /api/reception/expenses/summary
// Returns aggregate totals for the current filter set
// Used by the sticky summary footer on the expenses page
// ============================================
export const GET = withAuth(async (request: NextRequest, { user }) => {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Branch access scoping
    const branchAccess = await validateBranchAccess(user, searchParams.get('branchId'));
    if (branchAccess.error) {
      return NextResponse.json({ error: branchAccess.error }, { status: branchAccess.status });
    }
    const branchId = branchAccess.branchId;

    const totals = await getExpenseSummaryTotals(branchId, {
      dateFrom: searchParams.get('dateFrom') || undefined,
      dateTo: searchParams.get('dateTo') || undefined,
      expenseTypeId: searchParams.get('expenseTypeId') || undefined,
      paymentMethod: searchParams.get('paymentMethod') || undefined,
      recordedBy: searchParams.get('recordedBy') || undefined,
    });

    return NextResponse.json(totals);
  } catch (error) {
    console.error('Error fetching expense summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECEPTION_EXPENSES_VIEW, allowKiosk: true });
