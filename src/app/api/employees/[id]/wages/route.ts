import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getEmployeeWages, getEmployeeBranchWages, addEmployeeWage, updateEmployeeWage, removeEmployeeWage, getEmployeeTotalWages } from '@/lib/db';

// Combined wage entry type for display
interface CombinedWage {
  id: string;
  employee_id: string;
  source_type: 'primary' | 'additional';
  source_id: string; // legal_entity_id or branch_id
  source_name: string;
  source_inn?: string | null;
  wage_amount: number;
  wage_type: string;
  notes: string | null;
  is_active: boolean;
}

// GET /api/employees/[id]/wages - Get employee wages from all sources (Primary + Additional)
export const GET = withAuth(async (
  request: NextRequest,
  { params }
) => {
  try {
    const employeeId = params?.id;
    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
    }

    // Fetch both primary and additional wages in parallel
    const [primaryWages, additionalWages, totals] = await Promise.all([
      getEmployeeWages(employeeId),
      getEmployeeBranchWages(employeeId),
      getEmployeeTotalWages(employeeId),
    ]);

    // Combine and normalize the wages
    const combinedWages: CombinedWage[] = [
      // Primary wages (from legal entities - bank payments)
      ...primaryWages.map(w => ({
        id: w.id,
        employee_id: w.employee_id,
        source_type: 'primary' as const,
        source_id: w.legal_entity_id,
        source_name: w.legal_entities?.short_name || w.legal_entities?.name || w.legal_entity_id,
        source_inn: w.legal_entities?.inn,
        wage_amount: w.wage_amount,
        wage_type: 'primary', // Changed from 'official' to be clearer
        notes: w.notes,
        is_active: w.is_active,
        // Keep original for compatibility
        legal_entities: w.legal_entities,
        legal_entity_id: w.legal_entity_id,
      })),
      // Additional wages (from branches - cash payments)
      ...additionalWages.map(w => ({
        id: w.id,
        employee_id: w.employee_id,
        source_type: 'additional' as const,
        source_id: w.branch_id,
        source_name: w.branches?.name || w.branch_id,
        source_inn: null,
        wage_amount: w.wage_amount,
        wage_type: 'additional',
        notes: w.notes,
        is_active: w.is_active,
        // Keep original for compatibility
        branches: w.branches,
        branch_id: w.branch_id,
      })),
    ];

    // Calculate totals
    const primaryTotal = primaryWages.reduce((sum, w) => sum + (w.wage_amount || 0), 0);
    const additionalTotal = additionalWages.reduce((sum, w) => sum + (w.wage_amount || 0), 0);

    return NextResponse.json({
      wages: combinedWages,
      total: primaryTotal + additionalTotal,
      primaryTotal,
      additionalTotal,
      summary: totals.entities
    });
  } catch (error) {
    console.error('Error fetching employee wages:', error);
    return NextResponse.json({ error: 'Failed to fetch employee wages' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_VIEW_SALARY });

// POST /api/employees/[id]/wages - Add wage from a legal entity
export const POST = withAuth(async (
  request: NextRequest,
  { params }
) => {
  try {
    const employeeId = params?.id;
    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { legal_entity_id, wage_amount, wage_type, notes } = body;

    if (!legal_entity_id || wage_amount === undefined) {
      return NextResponse.json({ error: 'Legal entity ID and wage amount are required' }, { status: 400 });
    }

    const result = await addEmployeeWage({
      employee_id: employeeId,
      legal_entity_id,
      wage_amount: parseFloat(wage_amount),
      wage_type: wage_type || 'official',
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ wage: result.wage }, { status: 201 });
  } catch (error) {
    console.error('Error adding employee wage:', error);
    return NextResponse.json({ error: 'Failed to add employee wage' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT_SALARY });

// PUT /api/employees/[id]/wages - Update a wage entry
export const PUT = withAuth(async (
  request: NextRequest
) => {
  try {
    const body = await request.json();
    const { wage_id, wage_amount, notes, is_active } = body;

    if (!wage_id) {
      return NextResponse.json({ error: 'Wage ID required' }, { status: 400 });
    }

    const result = await updateEmployeeWage(wage_id, {
      wage_amount: wage_amount !== undefined ? parseFloat(wage_amount) : undefined,
      notes,
      is_active,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating employee wage:', error);
    return NextResponse.json({ error: 'Failed to update employee wage' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT_SALARY });

// DELETE /api/employees/[id]/wages - Remove a wage entry
export const DELETE = withAuth(async (
  request: NextRequest
) => {
  try {
    const { searchParams } = new URL(request.url);
    const wageId = searchParams.get('wage_id');

    if (!wageId) {
      return NextResponse.json({ error: 'Wage ID required' }, { status: 400 });
    }

    const result = await removeEmployeeWage(wageId);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing employee wage:', error);
    return NextResponse.json({ error: 'Failed to remove employee wage' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT_SALARY });
