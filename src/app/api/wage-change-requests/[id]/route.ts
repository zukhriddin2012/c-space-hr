import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import {
  getWageChangeRequestById,
  approveWageChangeRequest,
  rejectWageChangeRequest,
  cancelWageChangeRequest,
} from '@/lib/db';
import type { User } from '@/types';

// GET /api/wage-change-requests/[id] - Get a specific wage change request
export const GET = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const { params } = context;
    const requestId = params?.id;

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const wageChangeRequest = await getWageChangeRequestById(requestId);

    if (!wageChangeRequest) {
      return NextResponse.json({ error: 'Wage change request not found' }, { status: 404 });
    }

    return NextResponse.json({ request: wageChangeRequest });
  } catch (error) {
    console.error('Error fetching wage change request:', error);
    return NextResponse.json({ error: 'Failed to fetch wage change request' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT });

// PUT /api/wage-change-requests/[id] - Approve, reject, or cancel a wage change request
export const PUT = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const { user, params } = context;
    const requestId = params?.id;

    if (!requestId) {
      return NextResponse.json({ error: 'Request ID is required' }, { status: 400 });
    }

    const { action, rejection_reason } = await request.json();

    if (!action || !['approve', 'reject', 'cancel'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (approve/reject/cancel) is required' },
        { status: 400 }
      );
    }

    // Only GM/CEO can approve/reject wage change requests
    if (action === 'approve' || action === 'reject') {
      const canApprove = hasPermission(user.role, PERMISSIONS.EMPLOYEES_DELETE);

      if (!canApprove) {
        return NextResponse.json(
          { error: 'Only General Manager can approve or reject wage change requests' },
          { status: 403 }
        );
      }
    }

    if (action === 'reject' && !rejection_reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'approve') {
      result = await approveWageChangeRequest(requestId, user.id);
    } else if (action === 'reject') {
      result = await rejectWageChangeRequest(requestId, user.id, rejection_reason);
    } else {
      // cancel - can be done by the requester
      result = await cancelWageChangeRequest(requestId, user.id);
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    let message = '';
    switch (action) {
      case 'approve':
        message = 'Wage change request approved. The wage has been updated.';
        break;
      case 'reject':
        message = 'Wage change request rejected.';
        break;
      case 'cancel':
        message = 'Wage change request cancelled.';
        break;
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error processing wage change request:', error);
    return NextResponse.json({ error: 'Failed to process wage change request' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT });
