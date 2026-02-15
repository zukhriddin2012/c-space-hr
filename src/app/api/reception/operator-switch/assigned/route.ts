import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { getActiveBranchAssignments } from '@/lib/db/operator-switch';

// GET /api/reception/operator-switch/assigned?branchId=X
// Returns employees assigned to work at this branch (for streamlined PIN switch)
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    if (!branchId) {
      return NextResponse.json({ error: 'branchId is required' }, { status: 400 });
    }

    const assignments = await getActiveBranchAssignments(branchId);

    // Map to a lightweight response for the PIN overlay
    const operators = assignments.map(a => ({
      id: a.employeeId,
      name: a.employeeName || 'Unknown',
      homeBranchName: a.homeBranchName || 'Unknown',
      assignmentType: a.assignmentType || 'temporary',
    }));

    return NextResponse.json({ operators });
  } catch (error) {
    console.error('Error in GET /api/reception/operator-switch/assigned:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, { allowKiosk: true });
