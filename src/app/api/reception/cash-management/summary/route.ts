import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getCashPositionSummary } from '@/lib/db/cash-management';

// ============================================
// GET /api/reception/cash-management/summary
// Get full cash position summary for a branch
// ============================================
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const branchId = request.nextUrl.searchParams.get('branchId');
    if (!branchId) {
      return NextResponse.json({ error: 'branchId is required' }, { status: 400 });
    }

    const summary = await getCashPositionSummary(branchId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Failed to get cash summary:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECEPTION_CASH_VIEW, allowKiosk: true });
