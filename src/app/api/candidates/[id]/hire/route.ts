import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import { convertCandidateToEmployee } from '@/lib/db';
import type { User } from '@/types';

// POST /api/candidates/[id]/hire - Convert candidate to employee (from probation to hired)
export const POST = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const { user } = context;
    const id = context.params?.id;

    if (!id) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    // Only HR and GM can approve hires
    if (!['general_manager', 'hr', 'ceo'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Only HR or General Manager can approve hires' },
        { status: 403 }
      );
    }

    const { employment_type } = await request.json().catch(() => ({}));

    const result = await convertCandidateToEmployee(
      id,
      user.employeeId!,
      employment_type || 'full-time'
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      employee: result.employee,
      message: 'Candidate has been successfully hired and employee account created',
    });
  } catch (error) {
    console.error('Error hiring candidate:', error);
    return NextResponse.json({ error: 'Failed to hire candidate' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_MANAGE });
