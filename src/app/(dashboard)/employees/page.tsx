import { getSession } from '@/lib/auth-server';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { Search } from 'lucide-react';
import Link from 'next/link';
import { getEmployees, getBranches } from '@/lib/db';
import EmployeesTable from '@/components/EmployeesTable';

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
  const selectedStatus = params.status || 'active';
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
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900">Employees</h1>
          <p className="text-sm lg:text-base text-gray-500 mt-1">
            {totalEmployees} active
            {canViewSalary && <span className="hidden sm:inline"> • Budget: {formatSalary(totalBudget)}/mo</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <form className="bg-white rounded-xl border border-gray-200 p-3 lg:p-4 mb-4 lg:mb-6">
        <div className="flex flex-col gap-3 lg:gap-4">
          {/* Search - full width on mobile */}
          <div className="w-full">
            <label className="block text-xs font-medium text-gray-500 mb-1">Search</label>
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                name="search"
                defaultValue={searchQuery}
                placeholder="Search name, ID, position..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
              />
            </div>
          </div>

          {/* Filters row */}
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 lg:gap-4 items-end">
            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Branch</label>
              <select
                name="branch"
                defaultValue={selectedBranch}
                className="w-full sm:w-auto px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm sm:min-w-[140px]"
              >
                <option value="">All Branches</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Level</label>
              <select
                name="level"
                defaultValue={selectedLevel}
                className="w-full sm:w-auto px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
              >
                <option value="">All Levels</option>
                <option value="junior">Junior</option>
                <option value="middle">Middle</option>
                <option value="senior">Senior</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            <div className="col-span-1">
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                name="status"
                defaultValue={selectedStatus}
                className="w-full sm:w-auto px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="probation">Probation</option>
                <option value="inactive">Inactive</option>
                <option value="terminated">Terminated</option>
              </select>
            </div>

            <div className="col-span-1 flex gap-2">
              <button
                type="submit"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 lg:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
              >
                <Search size={16} />
                <span className="hidden sm:inline">Apply</span>
              </button>
              <Link
                href="/employees"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 lg:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
              >
                Reset
              </Link>
            </div>
          </div>
        </div>
      </form>

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
