import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import { createWageChangeRequest, getWageChangeRequests } from '@/lib/db';
import type { User } from '@/types';

// GET /api/wage-change-requests - List wage change requests
export const GET = withAuth(async (request: NextRequest, context: { user: User }) => {
  try {
    const { user } = context;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;

    // Only GM/CEO can view all wage change requests
    const canViewAll = hasPermission(user.role, PERMISSIONS.EMPLOYEES_DELETE);

    if (!canViewAll) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const requests = await getWageChangeRequests(status);

    return NextResponse.json({ requests });
  } catch (error) {
    console.error('Error fetching wage change requests:', error);
    return NextResponse.json({ error: 'Failed to fetch wage change requests' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT });

// POST /api/wage-change-requests - Create a wage change request
export const POST = withAuth(async (request: NextRequest, context: { user: User }) => {
  try {
    const { user } = context;
    const {
      employee_id,
      wage_type,
      legal_entity_id,
      branch_id,
      current_amount,
      proposed_amount,
      reason,
      effective_date,
      notes,
    } = await request.json();

    // Validate required fields
    if (!employee_id || !wage_type || current_amount === undefined || proposed_amount === undefined || !reason || !effective_date) {
      return NextResponse.json(
        { error: 'Employee ID, wage type, current amount, proposed amount, reason, and effective date are required' },
        { status: 400 }
      );
    }

    // Validate wage type specific fields
    if (wage_type === 'primary' && !legal_entity_id) {
      return NextResponse.json(
        { error: 'Legal entity ID is required for primary wage changes' },
        { status: 400 }
      );
    }
    if (wage_type === 'additional' && !branch_id) {
      return NextResponse.json(
        { error: 'Branch ID is required for additional wage changes' },
        { status: 400 }
      );
    }

    // Ensure amounts are different
    if (current_amount === proposed_amount) {
      return NextResponse.json(
        { error: 'Proposed amount must be different from current amount' },
        { status: 400 }
      );
    }

    const result = await createWageChangeRequest({
      employee_id,
      wage_type,
      legal_entity_id,
      branch_id,
      current_amount: parseFloat(current_amount),
      proposed_amount: parseFloat(proposed_amount),
      reason,
      effective_date,
      requested_by: user.id,
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      request: result.request,
    });
  } catch (error) {
    console.error('Error creating wage change request:', error);
    return NextResponse.json({ error: 'Failed to create wage change request' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT });
