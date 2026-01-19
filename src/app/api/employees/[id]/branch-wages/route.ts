import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import {
  getEmployeeBranchWages,
  addEmployeeBranchWage,
  updateEmployeeBranchWage,
  removeEmployeeBranchWage,
} from '@/lib/db';

// GET /api/employees/[id]/branch-wages - Get employee's additional (cash) wages from branches
export const GET = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const employeeId = params?.id;
      if (!employeeId) {
        return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
      }

      const wages = await getEmployeeBranchWages(employeeId);
      const total = wages.reduce((sum, w) => sum + (w.wage_amount || 0), 0);

      return NextResponse.json({
        wages,
        total,
        summary: wages.map((w) => ({
          branch: w.branches?.name || w.branch_id,
          amount: w.wage_amount,
        })),
      });
    } catch (error) {
      console.error('Error fetching employee branch wages:', error);
      return NextResponse.json({ error: 'Failed to fetch employee branch wages' }, { status: 500 });
    }
  },
  { permission: PERMISSIONS.EMPLOYEES_VIEW_SALARY }
);

// POST /api/employees/[id]/branch-wages - Add additional wage from a branch
export const POST = withAuth(
  async (request: NextRequest, { params }) => {
    try {
      const employeeId = params?.id;
      if (!employeeId) {
        return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
      }

      const body = await request.json();
      const { branch_id, wage_amount, notes } = body;

      if (!branch_id || wage_amount === undefined) {
        return NextResponse.json(
          { error: 'Branch ID and wage amount are required' },
          { status: 400 }
        );
      }

      const result = await addEmployeeBranchWage({
        employee_id: employeeId,
        branch_id,
        wage_amount: parseFloat(wage_amount),
        notes,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ wage: result.wage }, { status: 201 });
    } catch (error) {
      console.error('Error adding employee branch wage:', error);
      return NextResponse.json({ error: 'Failed to add employee branch wage' }, { status: 500 });
    }
  },
  { permission: PERMISSIONS.EMPLOYEES_EDIT_SALARY }
);

// PUT /api/employees/[id]/branch-wages - Update an additional wage entry
export const PUT = withAuth(
  async (request: NextRequest) => {
    try {
      const body = await request.json();
      const { wage_id, wage_amount, notes, is_active } = body;

      if (!wage_id) {
        return NextResponse.json({ error: 'Wage ID required' }, { status: 400 });
      }

      const result = await updateEmployeeBranchWage(wage_id, {
        wage_amount: wage_amount !== undefined ? parseFloat(wage_amount) : undefined,
        notes,
        is_active,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error updating employee branch wage:', error);
      return NextResponse.json({ error: 'Failed to update employee branch wage' }, { status: 500 });
    }
  },
  { permission: PERMISSIONS.EMPLOYEES_EDIT_SALARY }
);

// DELETE /api/employees/[id]/branch-wages - Remove an additional wage entry
export const DELETE = withAuth(
  async (request: NextRequest) => {
    try {
      const { searchParams } = new URL(request.url);
      const wageId = searchParams.get('wage_id');

      if (!wageId) {
        return NextResponse.json({ error: 'Wage ID required' }, { status: 400 });
      }

      const result = await removeEmployeeBranchWage(wageId);

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({ success: true });
    } catch (error) {
      console.error('Error removing employee branch wage:', error);
      return NextResponse.json({ error: 'Failed to remove employee branch wage' }, { status: 500 });
    }
  },
  { permission: PERMISSIONS.EMPLOYEES_EDIT_SALARY }
);
