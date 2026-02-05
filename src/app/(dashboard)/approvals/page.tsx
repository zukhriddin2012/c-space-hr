import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { ApprovalsHub } from './ApprovalsHub';
import {
  getPendingApprovalsForGM,
  getPendingPaymentRequestsForApproval,
} from '@/lib/db';
import { supabaseAdmin } from '@/lib/db/connection';

interface TerminationRequestRaw {
  id: string;
  requested_date: string;
  reason: string;
  status: string;
  created_at: string;
  employee: { id: string; full_name: string; employee_id: string; position: string } | null;
  requester: { full_name: string } | null;
}

interface WageChangeRequestRaw {
  id: string;
  wage_type: string;
  current_amount: number;
  proposed_amount: number;
  change_type: string;
  reason: string;
  effective_date: string;
  status: string;
  created_at: string;
  employee: { id: string; full_name: string; employee_id: string; position: string } | null;
  requester: { full_name: string } | null;
  legal_entity: { name: string } | null;
  branch: { name: string } | null;
}

async function getPendingTerminationRequests(limit: number = 10) {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('termination_requests')
    .select(`
      id,
      termination_date,
      reason,
      status,
      created_at,
      employee_id,
      requested_by
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching termination requests:', error);
    return [];
  }

  // Fetch employee details separately
  const employeeIds = [...new Set((data || []).flatMap(d => [d.employee_id, d.requested_by].filter(Boolean)))];
  const { data: employees } = await supabaseAdmin
    .from('employees')
    .select('id, full_name, employee_id, position')
    .in('id', employeeIds);

  const employeeMap = new Map((employees || []).map(e => [e.id, e]));

  // Transform Supabase response to expected format
  return (data || []).map((item: Record<string, unknown>) => {
    const emp = employeeMap.get(item.employee_id as string);
    const req = employeeMap.get(item.requested_by as string);
    return {
      id: item.id as string,
      requested_date: item.termination_date as string,
      reason: item.reason as string,
      status: item.status as string,
      created_at: item.created_at as string,
      employee: emp ? { id: emp.id, full_name: emp.full_name, employee_id: emp.employee_id, position: emp.position } : null,
      requester: req ? { full_name: req.full_name } : null,
    };
  });
}

async function getPendingWageChangeRequests(limit: number = 10) {
  if (!supabaseAdmin) return [];

  const { data, error } = await supabaseAdmin
    .from('wage_change_requests')
    .select(`
      id,
      wage_type,
      current_amount,
      proposed_amount,
      change_type,
      reason,
      effective_date,
      status,
      created_at,
      employee_id,
      requested_by,
      legal_entity_id,
      branch_id
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching wage change requests:', error);
    return [];
  }

  // Fetch related data separately
  const employeeIds = [...new Set((data || []).flatMap(d => [d.employee_id, d.requested_by].filter(Boolean)))];
  const legalEntityIds = [...new Set((data || []).map(d => d.legal_entity_id).filter(Boolean))];
  const branchIds = [...new Set((data || []).map(d => d.branch_id).filter(Boolean))];

  const [employeesRes, legalEntitiesRes, branchesRes] = await Promise.all([
    employeeIds.length > 0
      ? supabaseAdmin.from('employees').select('id, full_name, employee_id, position').in('id', employeeIds)
      : { data: [] },
    legalEntityIds.length > 0
      ? supabaseAdmin.from('legal_entities').select('id, name').in('id', legalEntityIds)
      : { data: [] },
    branchIds.length > 0
      ? supabaseAdmin.from('branches').select('id, name').in('id', branchIds)
      : { data: [] },
  ]);

  const employeeMap = new Map((employeesRes.data || []).map(e => [e.id, e]));
  const legalEntityMap = new Map((legalEntitiesRes.data || []).map(e => [e.id, e]));
  const branchMap = new Map((branchesRes.data || []).map(e => [e.id, e]));

  // Transform Supabase response to expected format
  return (data || []).map((item: Record<string, unknown>) => {
    const emp = employeeMap.get(item.employee_id as string);
    const req = employeeMap.get(item.requested_by as string);
    const le = legalEntityMap.get(item.legal_entity_id as string);
    const br = branchMap.get(item.branch_id as string);
    return {
      id: item.id as string,
      wage_type: item.wage_type as string,
      current_amount: item.current_amount as number,
      proposed_amount: item.proposed_amount as number,
      change_type: item.change_type as string,
      reason: item.reason as string,
      effective_date: item.effective_date as string,
      status: item.status as string,
      created_at: item.created_at as string,
      employee: emp ? { id: emp.id, full_name: emp.full_name, employee_id: emp.employee_id, position: emp.position } : null,
      requester: req ? { full_name: req.full_name } : null,
      legal_entity: le ? { name: le.name } : null,
      branch: br ? { name: br.name } : null,
    };
  });
}

export default async function ApprovalsPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Only managers can access this page
  const allowedRoles = ['general_manager', 'ceo', 'hr', 'chief_accountant'];
  if (!allowedRoles.includes(user.role)) {
    redirect('/dashboard');
  }

  // Fetch all pending requests
  const [counts, terminationRequestsRaw, wageChangeRequestsRaw, paymentRequestsRaw] = await Promise.all([
    getPendingApprovalsForGM(),
    getPendingTerminationRequests(20),
    getPendingWageChangeRequests(20),
    getPendingPaymentRequestsForApproval(20),
  ]);

  // Transform payment requests to have optional description
  const paymentRequests = paymentRequestsRaw.map(r => ({
    ...r,
    description: r.description ?? null,
  }));

  return (
    <ApprovalsHub
      counts={counts}
      terminationRequests={terminationRequestsRaw}
      wageChangeRequests={wageChangeRequestsRaw}
      paymentRequests={paymentRequests}
    />
  );
}
