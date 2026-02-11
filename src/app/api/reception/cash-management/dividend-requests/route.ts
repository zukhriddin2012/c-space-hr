import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import {
  getDividendSpendRequests,
  createDividendSpendRequest,
  reviewDividendSpendRequest,
} from '@/lib/db/cash-management';
import type { DividendSpendStatus } from '@/modules/reception/types';

// ============================================
// GET /api/reception/cash-management/dividend-requests
// List dividend spend requests
// ============================================
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const searchParams = request.nextUrl.searchParams;
    const branchId = searchParams.get('branchId');
    const status = searchParams.get('status') as DividendSpendStatus | null;
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');

    if (!branchId) {
      return NextResponse.json({ error: 'branchId is required' }, { status: 400 });
    }

    const result = await getDividendSpendRequests(
      branchId,
      status || undefined,
      page,
      pageSize
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to get dividend requests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECEPTION_CASH_VIEW, allowKiosk: true });

// ============================================
// POST /api/reception/cash-management/dividend-requests
// Create a dividend spend request
// ============================================
export const POST = withAuth(async (request: NextRequest, { employee }) => {
  try {
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const body = await request.json();
    const { branchId, expenseSubject, expenseAmount, expenseTypeId, expenseDate, opexPortion, dividendPortion, reason } = body;

    // Validation
    const errors: string[] = [];
    if (!branchId) errors.push('branchId is required');
    if (!expenseSubject?.trim()) errors.push('expenseSubject is required');
    if (!expenseAmount || expenseAmount <= 0) errors.push('expenseAmount must be positive');
    if (!expenseTypeId) errors.push('expenseTypeId is required');
    if (typeof opexPortion !== 'number' || opexPortion < 0) errors.push('opexPortion must be >= 0');
    if (typeof dividendPortion !== 'number' || dividendPortion <= 0) errors.push('dividendPortion must be > 0');
    if (!reason?.trim()) errors.push('reason is required');

    if (errors.length > 0) {
      return NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 });
    }

    const request_ = await createDividendSpendRequest(
      { branchId, expenseSubject, expenseAmount, expenseTypeId, expenseDate, opexPortion, dividendPortion, reason },
      employee.id
    );

    return NextResponse.json(request_, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Failed to create dividend request:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}, { permission: PERMISSIONS.RECEPTION_CASH_DIVIDEND_REQUEST, allowKiosk: true });

// ============================================
// PATCH /api/reception/cash-management/dividend-requests
// Approve or reject a dividend spend request (GM only)
// ============================================
export const PATCH = withAuth(async (request: NextRequest, { employee }) => {
  try {
    if (!employee) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }

    const body = await request.json();
    const { requestId, action, reviewNote } = body;

    if (!requestId) {
      return NextResponse.json({ error: 'requestId is required' }, { status: 400 });
    }
    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json({ error: 'action must be "approve" or "reject"' }, { status: 400 });
    }

    const result = await reviewDividendSpendRequest(
      { requestId, action, reviewNote },
      employee.id
    );

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    console.error('Failed to review dividend request:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}, { roles: ['general_manager'], allowKiosk: false });
