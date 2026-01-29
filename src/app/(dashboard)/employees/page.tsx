import { getSession } from '@/lib/auth-server';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getEmployees, getBranches } from '@/lib/db';
import { EmployeesTable } from '@/components/employee';
import EmployeesHeader from './EmployeesHeader';
import EmployeesFilters from './EmployeesFilters';

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  position: string;
  level: string;
  branch_id: string | null;
  salary: number | null;
  phone: string | null;
  email: string | null;
  status: string;
  employment_type?: string;
  hire_date: string;
  date_of_birth?: string | null;
  gender?: string | null;
  notes?: string | null;
  telegram_id?: string | null;
  branches?: { name: string };
}

function formatSalary(amount: number): string {
  if (!amount || amount === 0) return '-';
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<{ branch?: string; level?: string; status?: string; search?: string }>;
}) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Check permission
  if (!hasPermission(user.role, PERMISSIONS.EMPLOYEES_VIEW_ALL)) {
    redirect('/dashboard');
  }

  const canCreateEmployee = hasPermission(user.role, PERMISSIONS.EMPLOYEES_CREATE);
  const canViewSalary = hasPermission(user.role, PERMISSIONS.EMPLOYEES_VIEW_SALARY);
  const canEditEmployee = hasPermission(user.role, PERMISSIONS.EMPLOYEES_EDIT);
  const canEditSalary = hasPermission(user.role, PERMISSIONS.EMPLOYEES_EDIT_SALARY);
  const canAssignRoles = hasPermission(user.role, PERMISSIONS.USERS_ASSIGN_ROLES);

  // Get filter params
  const params = await searchParams;
  const selectedBranch = params.branch || '';
  const selectedLevel = params.level || '';
  const selectedStatus = params.status !== undefined ? params.status : 'active';
  const searchQuery = params.search || '';

  // Fetch real data from Supabase
  const [employees, branches] = await Promise.all([
    getEmployees(),
    getBranches(),
  ]);

  // Create branch map
  const branchMap = new Map(branches.map(b => [b.id, b.name]));

  // Apply filters
  let filteredEmployees = employees.filter((emp: Employee) => {
    // Status filter (default to active)
    if (selectedStatus && emp.status !== selectedStatus) return false;

    // Branch filter
    if (selectedBranch && emp.branch_id !== selectedBranch) return false;

    // Level filter
    if (selectedLevel && emp.level !== selectedLevel) return false;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        emp.full_name.toLowerCase().includes(query) ||
        emp.employee_id.toLowerCase().includes(query) ||
        emp.position.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Calculate totals
  const totalEmployees = employees.filter((e: Employee) => e.status === 'active').length;
  const totalBudget = employees
    .filter((e: Employee) => e.status === 'active')
    .reduce((sum: number, e: Employee) => sum + (e.salary || 0), 0);

  // Convert branchMap to plain object for serialization
  const branchMapObject = Object.fromEntries(branchMap);

  return (
    <div>
      {/* Header */}
      <EmployeesHeader
        totalEmployees={totalEmployees}
        totalBudget={formatSalary(totalBudget) + '/mo'}
        canViewSalary={canViewSalary}
      />

      {/* Filters */}
      <EmployeesFilters
        branches={branches}
        selectedBranch={selectedBranch}
        selectedLevel={selectedLevel}
        selectedStatus={selectedStatus}
        searchQuery={searchQuery}
      />

      {/* Employee List */}
      <EmployeesTable
        employees={filteredEmployees}
        branches={branches}
        branchMap={new Map(Object.entries(branchMapObject))}
        canViewSalary={canViewSalary}
        canEditEmployee={canEditEmployee}
        canEditSalary={canEditSalary}
        canCreateEmployee={canCreateEmployee}
        canAssignRoles={canAssignRoles}
      />
    </div>
  );
}
