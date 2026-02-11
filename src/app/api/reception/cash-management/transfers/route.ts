import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getCashTransfers, createCashTransfer } from '@/lib/db/cash-management';

// ============================================
// GET /api/reception/cash-management/transfers
// List cash transfer history
// ============================================
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const branchId = searchParams.get('branchId');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    if (!branchId) {
      return NextResponse.json({ error: 'branchId is required' }, { status: 400 });
    }

    const result = await getCashTransfers(branchId, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get cash transfers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECEPTION_CASH_VIEW, allowKiosk: true });

// ============================================
// POST /api/reception/cash-management/transfers
// Record a safe transfer (GM only)
// ============================================
export const POST = withAuth(async (request: NextRequest, { employee }) => {
  try {
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const body = await request.json();
    const { branchId, dividendAmount, marketingAmount, transferDate, notes } = body;

    if (!branchId) {
      return NextResponse.json({ error: 'branchId is required' }, { status: 400 });
    }
    if (typeof dividendAmount !== 'number' || dividendAmount < 0) {
      return NextResponse.json({ error: 'dividendAmount must be >= 0' }, { status: 400 });
    }
    if (typeof marketingAmount !== 'number' || marketingAmount < 0) {
      return NextResponse.json({ error: 'marketingAmount must be >= 0' }, { status: 400 });
    }
    if (dividendAmount + marketingAmount <= 0) {
      return NextResponse.json({ error: 'Total transfer must be > 0' }, { status: 400 });
    }

    const transfer = await createCashTransfer(
      { branchId, dividendAmount, marketingAmount, transferDate, notes },
      employee.id
    );

    return NextResponse.json(transfer, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Failed to create cash transfer:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}, { roles: ['general_manager'], allowKiosk: false });
