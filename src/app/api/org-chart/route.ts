import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

export async function GET() {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    // Fetch all active employees
    const { data: employees, error } = await supabaseAdmin!
      .from('employees')
      .select('id, employee_id, full_name, position, position_id, email, phone, telegram_id, level, status, manager_id, department_id, branch_id')
      .in('status', ['active', 'probation'])
      .order('full_name');

    if (error) {
      console.error('Error fetching employees for org chart:', error);
      return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
    }

    // Fetch departments, branches, and positions for mapping
    const [deptResult, branchResult, positionResult] = await Promise.all([
      supabaseAdmin!.from('departments').select('id, name'),
      supabaseAdmin!.from('branches').select('id, name'),
      supabaseAdmin!.from('positions').select('id, name, level')
    ]);

    const deptMap = new Map((deptResult.data || []).map(d => [d.id, d.name]));
    const branchMap = new Map((branchResult.data || []).map(b => [b.id, b.name]));
    const positionMap = new Map((positionResult.data || []).map(p => [p.id, { name: p.name, level: p.level }]));

    // Transform data for org chart
    const orgData = (employees || []).map(emp => {
      // Get position from positions table if position_id exists, otherwise fall back to position text field
      const positionData = emp.position_id ? positionMap.get(emp.position_id) : null;
      const positionName = positionData?.name || emp.position || 'Employee';
      const positionLevel = positionData?.level || emp.level;

      return {
        id: emp.id,
        employeeId: emp.employee_id,
        name: emp.full_name,
        position: positionName,
        email: emp.email,
        phone: emp.phone,
        telegramId: emp.telegram_id,
        photo: null,
        level: positionLevel,
        managerId: emp.manager_id,
        departmentId: emp.department_id,
        departmentName: emp.department_id ? deptMap.get(emp.department_id) || null : null,
        branchId: emp.branch_id,
        branchName: emp.branch_id ? branchMap.get(emp.branch_id) || null : null,
      };
    });

    // Build hierarchy tree
    const buildTree = (employees: typeof orgData, parentId: string | null = null): typeof orgData => {
      return employees
        .filter(emp => emp.managerId === parentId)
        .map(emp => ({
          ...emp,
          children: buildTree(employees, emp.id),
        }));
    };

    // Find roots (employees without managers)
    const roots = orgData.filter(emp => !emp.managerId);

    // Build tree for each root
    const tree = roots.map(root => ({
      ...root,
      children: buildTree(orgData, root.id),
    }));

    // Stats
    const stats = {
      totalEmployees: orgData.length,
      departments: new Set(orgData.map(e => e.departmentId).filter(Boolean)).size,
      managers: orgData.filter(e => orgData.some(other => other.managerId === e.id)).length,
      roots: roots.length,
    };

    return NextResponse.json({
      tree,
      flat: orgData,
      stats
    });
  } catch (error) {
    console.error('Org chart API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
