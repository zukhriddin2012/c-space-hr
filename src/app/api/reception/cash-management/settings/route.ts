import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getCashSettings, updateCashSettings } from '@/lib/db/cash-management';

// ============================================
// GET /api/reception/cash-management/settings
// Get cash management settings for a branch
// ============================================
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const branchId = request.nextUrl.searchParams.get('branchId');
    if (!branchId) {
      return NextResponse.json({ error: 'branchId is required' }, { status: 400 });
    }

    const settings = await getCashSettings(branchId);
    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to get cash settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECEPTION_CASH_VIEW, allowKiosk: true });

// ============================================
// PUT /api/reception/cash-management/settings
// Update cash management settings for a branch
// ============================================
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { branchId, marketingPercentage, transferThreshold } = body;

    if (!branchId) {
      return NextResponse.json({ error: 'branchId is required' }, { status: 400 });
    }
    if (marketingPercentage !== 2.5 && marketingPercentage !== 5.0) {
      return NextResponse.json({ error: 'marketingPercentage must be 2.5 or 5.0' }, { status: 400 });
    }
    if (!transferThreshold || transferThreshold <= 0) {
      return NextResponse.json({ error: 'transferThreshold must be positive' }, { status: 400 });
    }

    const settings = await updateCashSettings(branchId, {
      branchId,
      marketingPercentage,
      transferThreshold,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Failed to update cash settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECEPTION_CASH_SETTINGS, allowKiosk: false });
