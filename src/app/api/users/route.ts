import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getBranches } from '@/lib/db';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import { DEMO_USERS } from '@/lib/auth';
import type { UserRole } from '@/types';

export interface UserWithRole {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId?: string;
  branchName?: string;
  position?: string;
  department?: string;
  employeeId?: string;
}

// GET /api/users - Get all users with their roles
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only managers can view user roles
    if (!['general_manager', 'ceo', 'hr'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const branches = await getBranches();
    const branchMap = new Map(branches.map(b => [b.id, b.name]));

    // Try to get employees from database with system_role
    if (isSupabaseAdminConfigured()) {
      const { data: employees, error } = await supabaseAdmin!
        .from('employees')
        .select('*')
        .order('name');

      if (!error && employees) {
        const users: UserWithRole[] = employees.map(emp => {
          // Use database role if available, otherwise fall back to DEMO_USERS or 'employee'
          let role: UserRole = emp.system_role || 'employee';

          // Fall back to DEMO_USERS if no database role set
          if (!emp.system_role) {
            const demoUser = DEMO_USERS.find(u => u.email.toLowerCase() === emp.email?.toLowerCase());
            if (demoUser) {
              role = demoUser.role;
            }
          }

          return {
            id: emp.id,
            email: emp.email || '',
            name: emp.name,
            role,
            branchId: emp.branch_id || undefined,
            branchName: emp.branch_id ? branchMap.get(emp.branch_id) : undefined,
            position: emp.position,
            department: emp.department,
            employeeId: emp.employee_id,
          };
        });

        return NextResponse.json({ users, branches });
      }
    }

    // Fallback: Return empty if database not available
    return NextResponse.json({ users: [], branches });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}
