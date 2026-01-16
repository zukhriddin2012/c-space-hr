import { getSession } from '@/lib/auth-server';
import { hasPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Plus, MapPin, Users, Settings, CheckCircle, Clock, Wallet } from 'lucide-react';
import Link from 'next/link';
import { BRANCHES, EMPLOYEES, getEmployeesByBranch } from '@/lib/employee-data';

// Build branch data with real employee counts and salary budgets
const branchesWithStats = BRANCHES.map(branch => {
  const employees = getEmployeesByBranch(branch.id);
  const activeEmployees = employees.filter(e => e.status !== 'terminated');
  const salaryBudget = activeEmployees.reduce((sum, e) => sum + e.baseSalary, 0);
  // Simulate ~80% present for demo
  const presentToday = Math.floor(activeEmployees.length * 0.8);

  return {
    ...branch,
    totalEmployees: activeEmployees.length,
    presentToday,
    salaryBudget,
  };
});

function formatSalary(amount: number): string {
  if (amount === 0) return '-';
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

function BranchCard({
  branch,
  canManage,
  showSalary,
}: {
  branch: (typeof branchesWithStats)[0];
  canManage: boolean;
  showSalary: boolean;
}) {
  const presencePercentage = branch.totalEmployees > 0
    ? Math.round((branch.presentToday / branch.totalEmployees) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
            <MapPin size={24} className="text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{branch.name}</h3>
            <p className="text-sm text-gray-500">{branch.address}</p>
          </div>
        </div>
        {branch.isActive ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 rounded-full text-xs font-medium">
            <CheckCircle size={12} />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-50 text-gray-600 rounded-full text-xs font-medium">
            Inactive
          </span>
        )}
      </div>

      {/* Stats */}
      <div className={`grid ${showSalary ? 'grid-cols-3' : 'grid-cols-2'} gap-3 mb-4`}>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Users size={16} />
            <span>Staff</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {branch.totalEmployees}
          </p>
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Clock size={16} />
            <span>Present</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {branch.presentToday}
          </p>
        </div>
        {showSalary && (
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Wallet size={16} />
              <span>Budget</span>
            </div>
            <p className="text-sm font-semibold text-gray-900">
              {formatSalary(branch.salaryBudget)}
            </p>
          </div>
        )}
      </div>

      {/* Presence Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1">
          <span className="text-gray-500">Today&apos;s Presence</span>
          <span className="font-medium text-gray-900">{presencePercentage}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              presencePercentage >= 80
                ? 'bg-green-500'
                : presencePercentage >= 50
                ? 'bg-yellow-500'
                : 'bg-red-500'
            }`}
            style={{ width: `${presencePercentage}%` }}
          />
        </div>
      </div>

      {/* Geofence Info */}
      <div className="text-sm text-gray-500 mb-4">
        <span>Geofence: {branch.geofenceRadius}m radius</span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/branches/${branch.id}`}
          className="flex-1 px-4 py-2 text-center text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          View Details
        </Link>
        {canManage && (
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings size={18} />
          </button>
        )}
      </div>
    </div>
  );
}

export default async function BranchesPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Check permission
  if (!hasPermission(user.role, 'manage_branches') && !hasPermission(user.role, 'view_presence')) {
    redirect('/dashboard');
  }

  const canManageBranches = hasPermission(user.role, 'manage_branches');
  const canViewSalaries = user.role === 'general_manager' || user.role === 'ceo';

  // Filter to only show branches with employees
  const activeBranches = branchesWithStats.filter(b => b.totalEmployees > 0);
  const totalEmployees = activeBranches.reduce((sum, b) => sum + b.totalEmployees, 0);
  const totalPresent = activeBranches.reduce((sum, b) => sum + b.presentToday, 0);
  const totalSalaryBudget = activeBranches.reduce((sum, b) => sum + b.salaryBudget, 0);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Branches</h1>
          <p className="text-gray-500 mt-1">
            Manage C-Space coworking locations and track presence
          </p>
        </div>
        {canManageBranches && (
          <Link
            href="/branches/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <Plus size={20} />
            Add Branch
          </Link>
        )}
      </div>

      {/* Summary Stats */}
      <div className={`grid grid-cols-1 md:grid-cols-${canViewSalaries ? '5' : '4'} gap-4 mb-6`}>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Branches</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{BRANCHES.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">With Staff</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">
            {activeBranches.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Staff</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{totalEmployees}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Present Now</p>
          <p className="text-2xl font-semibold text-green-600 mt-1">{totalPresent}</p>
        </div>
        {canViewSalaries && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Monthly Budget</p>
            <p className="text-lg font-semibold text-gray-900 mt-1">{formatSalary(totalSalaryBudget)}</p>
          </div>
        )}
      </div>

      {/* Branch Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeBranches.map((branch) => (
          <BranchCard
            key={branch.id}
            branch={branch}
            canManage={canManageBranches}
            showSalary={canViewSalaries}
          />
        ))}
      </div>
    </div>
  );
}
