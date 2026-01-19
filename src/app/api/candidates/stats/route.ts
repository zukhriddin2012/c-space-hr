import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getCandidateStats } from '@/lib/db';
import type { User } from '@/types';

// GET /api/candidates/stats - Get recruitment statistics
export const GET = withAuth(async (request: NextRequest, context: { user: User }) => {
  try {
    const stats = await getCandidateStats();

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching candidate stats:', error);
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_VIEW });
