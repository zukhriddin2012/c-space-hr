import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getBranchRequirements } from '@/lib/db';
import type { User } from '@/types';

// GET /api/branches/shift-requirements - List all branch requirements
export const GET = withAuth(async (request: NextRequest, context: { user: User }) => {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branch_id') || undefined;

    const requirements = await getBranchRequirements(branchId);

    return NextResponse.json({ requirements });
  } catch (error) {
    console.error('Error fetching branch requirements:', error);
    return NextResponse.json({ error: 'Failed to fetch requirements' }, { status: 500 });
  }
}, { permission: PERMISSIONS.SHIFTS_VIEW });
