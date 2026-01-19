import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import { getUnreadFeedbackCount } from '@/lib/db';
import type { User } from '@/types';

// GET /api/feedback/count - Get unread feedback count (GM only)
export const GET = withAuth(async (request: NextRequest, context: { user: User }) => {
  try {
    const { user } = context;

    // Only GM/CEO can see unread count
    const canViewAll = hasPermission(user.role, PERMISSIONS.FEEDBACK_VIEW_ALL);

    if (!canViewAll) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const count = await getUnreadFeedbackCount();

    return NextResponse.json({ count });
  } catch (error) {
    console.error('Error fetching feedback count:', error);
    return NextResponse.json({ error: 'Failed to fetch count' }, { status: 500 });
  }
}, { permission: PERMISSIONS.FEEDBACK_SUBMIT });
