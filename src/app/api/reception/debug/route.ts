import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

// GET /api/reception/debug
// Debug endpoint to see what's happening with branch lookup
export const GET = withAuth(async (request, { user }) => {
  try {
    const debug: Record<string, unknown> = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      lookupAttempts: [],
    };

    // Get all branches
    const { data: allBranches } = await supabaseAdmin!
      .from('branches')
      .select('id, name');
    debug.allBranches = allBranches;

    // Try UUID lookup
    if (user.id && user.id.includes('-')) {
      const { data } = await supabaseAdmin!
        .from('employees')
        .select('id, full_name, email, branch_id, employee_id')
        .eq('id', user.id)
        .maybeSingle();
      (debug.lookupAttempts as unknown[]).push({ method: 'UUID', query: user.id, result: data });
    }

    // Try email lookup
    if (user.email) {
      const { data } = await supabaseAdmin!
        .from('employees')
        .select('id, full_name, email, branch_id, employee_id')
        .eq('email', user.email)
        .maybeSingle();
      (debug.lookupAttempts as unknown[]).push({ method: 'email', query: user.email, result: data });
    }

    // Try employee_id lookup
    if (user.id && !user.id.includes('-')) {
      const empIdFormatted = `EMP${user.id.padStart(3, '0')}`;
      const { data } = await supabaseAdmin!
        .from('employees')
        .select('id, full_name, email, branch_id, employee_id')
        .eq('employee_id', empIdFormatted)
        .maybeSingle();
      (debug.lookupAttempts as unknown[]).push({ method: 'employee_id', query: empIdFormatted, result: data });
    }

    // Try name lookup
    if (user.name) {
      const { data } = await supabaseAdmin!
        .from('employees')
        .select('id, full_name, email, branch_id, employee_id')
        .eq('full_name', user.name)
        .maybeSingle();
      (debug.lookupAttempts as unknown[]).push({ method: 'full_name', query: user.name, result: data });
    }

    // Get a sample of employees to see format
    const { data: sampleEmployees } = await supabaseAdmin!
      .from('employees')
      .select('id, full_name, email, branch_id, employee_id')
      .limit(5);
    debug.sampleEmployees = sampleEmployees;

    return NextResponse.json(debug, { status: 200 });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
});
