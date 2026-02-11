import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getUndeliveredInkassoTransactions } from '@/lib/db/cash-management';

// ============================================
// GET /api/reception/cash-management/inkasso-undelivered
// Get undelivered inkasso transactions for a branch
// ============================================
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const branchId = request.nextUrl.searchParams.get('branchId');
    if (!branchId) {
      return NextResponse.json({ error: 'branchId is required' }, { status: 400 });
    }

    const result = await getUndeliveredInkassoTransactions(branchId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get undelivered inkasso:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECEPTION_CASH_VIEW, allowKiosk: true });
