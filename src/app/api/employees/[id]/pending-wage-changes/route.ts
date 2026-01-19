import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getEmployeePendingWageChanges } from '@/lib/db';
import type { User } from '@/types';

// GET /api/employees/[id]/pending-wage-changes - Get pending wage change requests for an employee
export const GET = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const { params } = context;
    const employeeId = params?.id;

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const pendingChanges = await getEmployeePendingWageChanges(employeeId);

    return NextResponse.json({ pendingChanges });
  } catch (error) {
    console.error('Error fetching pending wage changes:', error);
    return NextResponse.json({ error: 'Failed to fetch pending wage changes' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT });
