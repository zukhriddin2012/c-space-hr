import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getCashAllocationBalance } from '@/lib/db/cash-management';

// ============================================
// GET /api/reception/cash-management/balance
// Get cash allocation balance for a branch
// ============================================
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const branchId = request.nextUrl.searchParams.get('branchId');
    if (!branchId) {
      return NextResponse.json({ error: 'branchId is required' }, { status: 400 });
    }

    const balance = await getCashAllocationBalance(branchId);
    return NextResponse.json(balance);
  } catch (error) {
    console.error('Failed to get cash balance:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECEPTION_CASH_VIEW, allowKiosk: true });
