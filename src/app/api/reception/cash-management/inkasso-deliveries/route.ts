import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getInkassoDeliveries, createInkassoDelivery } from '@/lib/db/cash-management';

// ============================================
// GET /api/reception/cash-management/inkasso-deliveries
// List inkasso delivery history
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

    const result = await getInkassoDeliveries(branchId, page, pageSize);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get inkasso deliveries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECEPTION_CASH_VIEW, allowKiosk: true });

// ============================================
// POST /api/reception/cash-management/inkasso-deliveries
// Record a new inkasso delivery batch
// ============================================
export const POST = withAuth(async (request: NextRequest, { employee }) => {
  try {
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const body = await request.json();
    const { branchId, transactionIds, deliveredDate, notes } = body;

    if (!branchId) {
      return NextResponse.json({ error: 'branchId is required' }, { status: 400 });
    }
    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return NextResponse.json({ error: 'transactionIds must be a non-empty array' }, { status: 400 });
    }

    const delivery = await createInkassoDelivery(
      { branchId, transactionIds, deliveredDate, notes },
      employee.id
    );

    return NextResponse.json(delivery, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Failed to create inkasso delivery:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}, { permission: PERMISSIONS.RECEPTION_CASH_VIEW, allowKiosk: true });
