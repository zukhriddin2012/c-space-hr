import { getSession } from '@/lib/auth-server';
import { getRoleLabel } from '@/lib/auth';
import { redirect } from 'next/navigation';
import {
  Users,
  Clock,
  MapPin,
  AlertCircle,
  CheckCircle,
  UserCheck,
  Briefcase,
  TrendingUp,
  Building2,
} from 'lucide-react';
import { getTodayAttendance, getBranches, getEmployees, getAttendanceStats } from '@/lib/db';

// Interfaces
interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  position: string;
  level: string;
  branch_id: string | null;
  salary: number | null;
  status: string;
  employment_type?: string;
  branches?: { name: string };
}

interface Branch {
  id: string;
  name: string;
}

interface RecentActivityItem {
  id: string;
  type: 'check_in' | 'check_out' | 'late';
  employee: string;
  branch: string;
  time: string;
}

interface BranchStats {
  id: string;
  name: string;
  employeeCount: number;
}

// Function to fetch recent activity from database
async function getRecentActivity(): Promise<RecentActivityItem[]> {
  const attendance = await getTodayAttendance();

  const activities: RecentActivityItem[] = [];

  attendance.forEach((record: any) => {
    const employeeName = record.employees?.full_name || 'Unknown';

    if (record.check_in) {
      const checkInBranch = record.check_in_branch?.name || '-';
      activities.push({
        id: `${record.id}-in`,
        type: record.status === 'late' ? 'late' : 'check_in',
        employee: employeeName,
        branch: checkInBranch,
        time: record.check_in,
      });
    }

    if (record.check_out) {
      const checkOutBranch = record.check_out_branch?.name || record.check_in_branch?.name || '-';
      activities.push({
        id: `${record.id}-out`,
        type: 'check_out',
        employee: employeeName,
        branch: checkOutBranch,
        time: record.check_out,
      });
    }
  });

  return activities
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 6);
}

// Calculate dashboard stats from real database data
async function getDashboardStats() {
  const [employees, branches] = await Promise.all([
    getEmployees(),
    getBranches(),
  ]);

  const activeEmployees = employees.filter((e: Employee) => e.status === 'active' || e.status === 'probation');

  // Employment type counts
  const fullTimeCount = activeEmployees.filter((e: Employee) => e.employment_type === 'full-time' || !e.employment_type).length;
  const partTimeCount = activeEmployees.filter((e: Employee) => e.employment_type === 'part-time').length;
  const internshipCount = activeEmployees.filter((e: Employee) => e.employment_type === 'internship').length;
  const probationTypeCount = activeEmployees.filter((e: Employee) => e.employment_type === 'probation').length;

  // Level counts
  const juniorCount = activeEmployees.filter((e: Employee) => e.level === 'junior').length;
  const middleCount = activeEmployees.filter((e: Employee) => e.level === 'middle').length;
  const seniorCount = activeEmployees.filter((e: Employee) => e.level === 'senior').length;
  const executiveCount = activeEmployees.filter((e: Employee) => e.level === 'executive').length;

  // Status counts
  const probationStatusCount = employees.filter((e: Employee) => e.status === 'probation').length;

  // Total salary budget
  const totalSalaryBudget = activeEmployees.reduce((sum: number, e: Employee) => sum + (e.salary || 0), 0);

  // Branch stats
  const branchStats: BranchStats[] = branches.map((branch: Branch) => ({
    id: branch.id,
    name: branch.name,
    employeeCount: activeEmployees.filter((e: Employee) => e.branch_id === branch.id).length,
  })).filter((b: BranchStats) => b.employeeCount > 0);

  // Top earners
  const topEarners = [...activeEmployees]
    .sort((a: Employee, b: Employee) => (b.salary || 0) - (a.salary || 0))
    .slice(0, 5);

  return {
    totalEmployees: activeEmployees.length,
    fullTimeCount,
    partTimeCount,
    internshipCount,
    probationTypeCount,
    juniorCount,
    middleCount,
    seniorCount,
    executiveCount,
    probationStatusCount,
    totalSalaryBudget,
    totalBranches: branches.length,
    branchStats,
    topEarners,
  };
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'purple',
}: {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  trend?: string;
  color?: 'purple' | 'green' | 'red' | 'blue' | 'orange';
}) {
  const colorClasses = {
    purple: 'bg-purple-50 text-purple-600',
    green: 'bg-green-50 text-green-600',
    red: 'bg-red-50 text-red-600',
    blue: 'bg-blue-50 text-blue-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
          {trend && <p className="text-xs text-green-600 mt-1">{trend}</p>}
        </div>
        <div className={`p-2.5 rounded-lg ${colorClasses[color]}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function BranchPresenceCard({
  branches,
  totalEmployees,
}: {
  branches: BranchStats[];
  totalEmployees: number;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Building2 size={20} className="text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">Branch Staffing</h3>
      </div>
      <div className="space-y-3">
        {branches.map((branch) => {
          const percentage = totalEmployees > 0 ? Math.round((branch.employeeCount / totalEmployees) * 100) : 0;
          return (
            <div key={branch.id}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">{branch.name}</span>
                <span className="text-gray-500">
                  {branch.employeeCount} employees ({percentage}%)
                </span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500 rounded-full transition-all"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
        {branches.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">No branch data available</p>
        )}
      </div>
    </div>
  );
}

function RecentActivityCard({
  activities,
}: {
  activities: RecentActivityItem[];
}) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'check_in':
        return <CheckCircle size={16} className="text-green-500" />;
      case 'check_out':
        return <Clock size={16} className="text-blue-500" />;
      case 'late':
        return <AlertCircle size={16} className="text-orange-500" />;
      default:
        return <Clock size={16} className="text-gray-500" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'check_in':
        return 'checked in at';
      case 'check_out':
        return 'checked out from';
      case 'late':
        return 'arrived late at';
      default:
        return '';
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
      <div className="space-y-3">
        {activities.length > 0 ? (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className="mt-0.5">{getActivityIcon(activity.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.employee}</span>{' '}
                  <span className="text-gray-500">{getActivityLabel(activity.type)}</span>{' '}
                  <span className="text-gray-700">{activity.branch}</span>
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No activity today</p>
        )}
      </div>
    </div>
  );
}

function LevelDistributionCard({
  juniorCount,
  middleCount,
  seniorCount,
  executiveCount,
}: {
  juniorCount: number;
  middleCount: number;
  seniorCount: number;
  executiveCount: number;
}) {
  const levels = [
    { label: 'Junior', count: juniorCount, color: 'bg-blue-500' },
    { label: 'Middle', count: middleCount, color: 'bg-purple-500' },
    { label: 'Senior', count: seniorCount, color: 'bg-indigo-500' },
    { label: 'Executive', count: executiveCount, color: 'bg-pink-500' },
  ];

  const total = levels.reduce((sum, l) => sum + l.count, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Levels</h3>
      <div className="space-y-3">
        {levels.map((level) => {
          const percentage = total > 0 ? Math.round((level.count / total) * 100) : 0;
          return (
            <div key={level.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">{level.label}</span>
                <span className="text-gray-500">{level.count} ({percentage}%)</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${level.color} rounded-full transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EmploymentTypeCard({
  fullTime,
  partTime,
  internship,
  probation,
}: {
  fullTime: number;
  partTime: number;
  internship: number;
  probation: number;
}) {
  const types = [
    { label: 'Full-time', count: fullTime, color: 'bg-emerald-500' },
    { label: 'Part-time', count: partTime, color: 'bg-orange-500' },
    { label: 'Internship', count: internship, color: 'bg-cyan-500' },
    { label: 'Probation', count: probation, color: 'bg-amber-500' },
  ];

  const total = types.reduce((sum, t) => sum + t.count, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Employment Types</h3>
      <div className="space-y-3">
        {types.map((type) => {
          const percentage = total > 0 ? Math.round((type.count / total) * 100) : 0;
          return (
            <div key={type.label}>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-700">{type.label}</span>
                <span className="text-gray-500">{type.count} ({percentage}%)</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${type.color} rounded-full transition-all`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopEarnersCard({
  employees,
  formatCurrency,
}: {
  employees: Employee[];
  formatCurrency: (amount: number) => string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Salaries</h3>
      <div className="space-y-3">
        {employees.length > 0 ? (
          employees.map((emp, index) => (
            <div key={emp.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-sm font-medium text-purple-700">
                  {index + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{emp.full_name}</p>
                  <p className="text-xs text-gray-500">{emp.position}</p>
                </div>
              </div>
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(emp.salary || 0)}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No salary data available</p>
        )}
      </div>
    </div>
  );
}

export default async function DashboardPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
  };

  // Fetch all data from Supabase
  const [stats, attendanceStats, recentActivity] = await Promise.all([
    getDashboardStats(),
    getAttendanceStats(),
    getRecentActivity(),
  ]);

  const presentToday = attendanceStats.present;
  const lateToday = attendanceStats.late;
  const absentToday = attendanceStats.absent;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Welcome back, {user.name}! Here&apos;s your overview as {getRoleLabel(user.role)}.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard
          title="Total Employees"
          value={stats.totalEmployees}
          icon={Users}
          trend={`${stats.fullTimeCount} full-time, ${stats.partTimeCount} part-time`}
          color="purple"
        />
        <StatCard
          title="Present Today"
          value={presentToday}
          icon={UserCheck}
          color="green"
        />
        <StatCard
          title="Late Today"
          value={lateToday}
          icon={AlertCircle}
          color="orange"
        />
        {(user.role === 'general_manager' || user.role === 'ceo' || user.role === 'hr') && (
          <StatCard
            title="On Probation"
            value={stats.probationStatusCount}
            icon={Briefcase}
            color="blue"
          />
        )}
      </div>

      {/* Additional Stats for GM/CEO */}
      {(user.role === 'general_manager' || user.role === 'ceo') && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard
            title="Active Branches"
            value={stats.totalBranches}
            icon={MapPin}
            color="purple"
          />
          <StatCard
            title="Monthly Wage Budget"
            value={formatCurrency(stats.totalSalaryBudget)}
            icon={TrendingUp}
            color="green"
          />
          <StatCard
            title="Absent Today"
            value={absentToday}
            icon={AlertCircle}
            color="red"
          />
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <BranchPresenceCard
          branches={stats.branchStats}
          totalEmployees={stats.totalEmployees}
        />
        <LevelDistributionCard
          juniorCount={stats.juniorCount}
          middleCount={stats.middleCount}
          seniorCount={stats.seniorCount}
          executiveCount={stats.executiveCount}
        />
      </div>

      {/* Employment Types and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <EmploymentTypeCard
          fullTime={stats.fullTimeCount}
          partTime={stats.partTimeCount}
          internship={stats.internshipCount}
          probation={stats.probationTypeCount}
        />
        <RecentActivityCard activities={recentActivity} />
      </div>

      {/* Top Salaries Card for GM/CEO */}
      {(user.role === 'general_manager' || user.role === 'ceo') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopEarnersCard
            employees={stats.topEarners}
            formatCurrency={formatCurrency}
          />
        </div>
      )}

      {/* Employee Self-Service View */}
      {user.role === 'employee' && (
        <div className="mt-6">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <button className="flex items-center justify-center gap-2 p-4 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors">
                <Clock size={20} />
                <span className="font-medium">Check In</span>
              </button>
              <button className="flex items-center justify-center gap-2 p-4 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors">
                <Clock size={20} />
                <span className="font-medium">Check Out</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
