import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import {
  getFeedbackById,
  markFeedbackRead,
  acknowledgeFeedback,
} from '@/lib/db';
import type { User } from '@/types';

// GET /api/feedback/[id] - Get specific feedback
export const GET = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const { user, params } = context;
    const feedbackId = params?.id;

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    // Only GM/CEO can view feedback details
    const canViewAll = hasPermission(user.role, PERMISSIONS.FEEDBACK_VIEW_ALL);

    if (!canViewAll) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const feedback = await getFeedbackById(feedbackId);

    if (!feedback) {
      return NextResponse.json({ error: 'Feedback not found' }, { status: 404 });
    }

    return NextResponse.json({ feedback });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}, { permission: PERMISSIONS.FEEDBACK_SUBMIT });

// PUT /api/feedback/[id] - Mark feedback as read or acknowledged (GM only)
export const PUT = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const { user, params } = context;
    const feedbackId = params?.id;

    if (!feedbackId) {
      return NextResponse.json({ error: 'Feedback ID is required' }, { status: 400 });
    }

    // Only GM/CEO can update feedback status
    const canViewAll = hasPermission(user.role, PERMISSIONS.FEEDBACK_VIEW_ALL);

    if (!canViewAll) {
      return NextResponse.json({ error: 'Only General Manager can update feedback status' }, { status: 403 });
    }

    const { action, response_note } = await request.json();

    if (!action || !['read', 'acknowledge'].includes(action)) {
      return NextResponse.json(
        { error: 'Valid action (read/acknowledge) is required' },
        { status: 400 }
      );
    }

    let result;
    if (action === 'read') {
      result = await markFeedbackRead(feedbackId, user.id);
    } else {
      result = await acknowledgeFeedback(feedbackId, user.id, response_note);
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    let message = '';
    switch (action) {
      case 'read':
        message = 'Feedback marked as read.';
        break;
      case 'acknowledge':
        message = 'Feedback acknowledged.';
        break;
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error updating feedback:', error);
    return NextResponse.json({ error: 'Failed to update feedback' }, { status: 500 });
  }
}, { permission: PERMISSIONS.FEEDBACK_VIEW_ALL });
