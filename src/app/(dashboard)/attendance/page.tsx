import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import {
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Download,
  Filter,
  Calendar,
  MapPin,
  Users,
  TrendingUp,
} from 'lucide-react';
import { EMPLOYEES, BRANCHES, getEmployeesByBranch } from '@/lib/employee-data';

// Generate attendance data for today based on real employees
function generateTodayAttendance() {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  const activeEmployees = EMPLOYEES.filter(e => e.status !== 'terminated');

  return activeEmployees.map((employee, index) => {
    // Simulate different attendance statuses
    const random = Math.random();
    let status: 'present' | 'late' | 'absent' | 'early_leave';
    let checkInTime: string | null = null;
    let checkOutTime: string | null = null;

    if (random < 0.75) {
      // 75% present on time
      status = 'present';
      const hour = 8 + Math.floor(Math.random() * 2); // 8-9 AM
      const minute = Math.floor(Math.random() * 60);
      checkInTime = `${todayStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

      // 60% have checked out
      if (Math.random() < 0.6) {
        const outHour = 17 + Math.floor(Math.random() * 2); // 5-6 PM
        const outMinute = Math.floor(Math.random() * 60);
        checkOutTime = `${todayStr}T${outHour.toString().padStart(2, '0')}:${outMinute.toString().padStart(2, '0')}:00`;
      }
    } else if (random < 0.88) {
      // 13% late
      status = 'late';
      const hour = 9 + Math.floor(Math.random() * 2); // 9-10 AM (after 9)
      const minute = 15 + Math.floor(Math.random() * 45); // At least 15 min late
      checkInTime = `${todayStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

      if (Math.random() < 0.4) {
        const outHour = 17 + Math.floor(Math.random() * 2);
        const outMinute = Math.floor(Math.random() * 60);
        checkOutTime = `${todayStr}T${outHour.toString().padStart(2, '0')}:${outMinute.toString().padStart(2, '0')}:00`;
      }
    } else if (random < 0.95) {
      // 7% absent
      status = 'absent';
    } else {
      // 5% early leave
      status = 'early_leave';
      const hour = 8 + Math.floor(Math.random() * 1);
      const minute = Math.floor(Math.random() * 60);
      checkInTime = `${todayStr}T${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`;

      const outHour = 14 + Math.floor(Math.random() * 2); // Left early 2-4 PM
      const outMinute = Math.floor(Math.random() * 60);
      checkOutTime = `${todayStr}T${outHour.toString().padStart(2, '0')}:${outMinute.toString().padStart(2, '0')}:00`;
    }

    const branch = BRANCHES.find(b => b.id === employee.branchId);

    return {
      id: `att-${index + 1}`,
      employeeId: employee.employeeId,
      employeeName: employee.fullName,
      position: employee.position,
      branchId: employee.branchId,
      branchName: branch?.name || employee.branchId,
      checkInTime,
      checkOutTime,
      status,
      source: checkInTime ? (Math.random() > 0.3 ? 'telegram' : 'web') as 'telegram' | 'web' | 'manual' : null,
    };
  });
}

// Generate weekly attendance summary
function generateWeeklySummary() {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const totalEmployees = EMPLOYEES.filter(e => e.status !== 'terminated').length;

  return days.map((day, index) => {
    const presentRate = 75 + Math.floor(Math.random() * 20); // 75-95%
    const present = Math.floor(totalEmployees * presentRate / 100);
    const late = Math.floor(totalEmployees * (5 + Math.random() * 10) / 100);
    const absent = totalEmployees - present - late;

    return {
      day,
      present,
      late,
      absent: Math.max(0, absent),
      total: totalEmployees,
    };
  });
}

const todayAttendance = generateTodayAttendance();
const weeklySummary = generateWeeklySummary();

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<
    string,
    { label: string; className: string; icon: React.ComponentType<{ size?: number }> }
  > = {
    present: {
      label: 'Present',
      className: 'bg-green-50 text-green-700',
      icon: CheckCircle,
    },
    late: {
      label: 'Late',
      className: 'bg-orange-50 text-orange-700',
      icon: AlertCircle,
    },
    absent: {
      label: 'Absent',
      className: 'bg-red-50 text-red-700',
      icon: XCircle,
    },
    early_leave: {
      label: 'Early Leave',
      className: 'bg-yellow-50 text-yellow-700',
      icon: Clock,
    },
  };

  const config = statusConfig[status] || statusConfig.absent;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${config.className}`}
    >
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function SourceBadge({ source }: { source: string | null }) {
  if (!source) return <span className="text-gray-400">-</span>;

  const sourceConfig: Record<string, { label: string; className: string }> = {
    telegram: { label: 'Telegram', className: 'bg-blue-50 text-blue-700' },
    web: { label: 'Web', className: 'bg-purple-50 text-purple-700' },
    manual: { label: 'Manual', className: 'bg-gray-50 text-gray-700' },
  };

  const config = sourceConfig[source] || sourceConfig.manual;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function formatTime(dateString: string | null) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function calculateHours(checkIn: string | null, checkOut: string | null) {
  if (!checkIn || !checkOut) return '-';
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
  return `${hours.toFixed(1)}h`;
}

function BranchAttendanceCard({ branchId, branchName }: { branchId: string; branchName: string }) {
  const branchAttendance = todayAttendance.filter(a => a.branchId === branchId);
  const present = branchAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const total = branchAttendance.length;
  const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

  return (
    <div className="bg-gray-50 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-900">{branchName}</span>
        <span className="text-xs text-gray-500">{present}/{total}</span>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            percentage >= 80 ? 'bg-green-500' : percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export default async function AttendancePage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // For employees, show only their own attendance
  const isEmployee = user.role === 'employee';

  const stats = {
    present: todayAttendance.filter((a) => a.status === 'present').length,
    late: todayAttendance.filter((a) => a.status === 'late').length,
    absent: todayAttendance.filter((a) => a.status === 'absent').length,
    earlyLeave: todayAttendance.filter((a) => a.status === 'early_leave').length,
  };

  const totalActive = stats.present + stats.late + stats.earlyLeave;
  const attendanceRate = Math.round((totalActive / todayAttendance.length) * 100);

  // Get branches with employees
  const activeBranches = BRANCHES.filter(b => {
    const employees = getEmployeesByBranch(b.id);
    return employees.filter(e => e.status !== 'terminated').length > 0;
  });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Attendance</h1>
          <p className="text-gray-500 mt-1">
            {isEmployee
              ? 'View your attendance history'
              : `Today's attendance across ${activeBranches.length} branches`}
          </p>
        </div>
        {!isEmployee && (
          <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            <Download size={20} />
            Export Report
          </button>
        )}
      </div>

      {/* Stats Summary */}
      {!isEmployee && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-2">
              <Users size={20} />
              <span className="text-sm font-medium">Total</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{todayAttendance.length}</p>
            <p className="text-xs text-gray-500 mt-1">employees</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-green-600 mb-2">
              <CheckCircle size={20} />
              <span className="text-sm font-medium">Present</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stats.present}</p>
            <p className="text-xs text-green-600 mt-1">{attendanceRate}% rate</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-orange-600 mb-2">
              <AlertCircle size={20} />
              <span className="text-sm font-medium">Late</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stats.late}</p>
            <p className="text-xs text-orange-600 mt-1">after 9:00 AM</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <XCircle size={20} />
              <span className="text-sm font-medium">Absent</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stats.absent}</p>
            <p className="text-xs text-red-600 mt-1">not checked in</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-yellow-600 mb-2">
              <Clock size={20} />
              <span className="text-sm font-medium">Early Leave</span>
            </div>
            <p className="text-2xl font-semibold text-gray-900">{stats.earlyLeave}</p>
            <p className="text-xs text-yellow-600 mt-1">left before 5 PM</p>
          </div>
        </div>
      )}

      {/* Branch Attendance Overview */}
      {!isEmployee && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin size={20} className="text-purple-600" />
            <h3 className="font-semibold text-gray-900">Branch Attendance</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {activeBranches.map(branch => (
              <BranchAttendanceCard
                key={branch.id}
                branchId={branch.id}
                branchName={branch.name}
              />
            ))}
          </div>
        </div>
      )}

      {/* Weekly Summary Chart */}
      {!isEmployee && (
        <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={20} className="text-purple-600" />
            <h3 className="font-semibold text-gray-900">This Week&apos;s Attendance</h3>
          </div>
          <div className="flex items-end gap-4 h-32">
            {weeklySummary.map((day, index) => {
              const presentHeight = (day.present / day.total) * 100;
              const lateHeight = (day.late / day.total) * 100;
              return (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col-reverse h-24 bg-gray-100 rounded overflow-hidden">
                    <div
                      className="bg-green-500 transition-all"
                      style={{ height: `${presentHeight}%` }}
                    />
                    <div
                      className="bg-orange-400 transition-all"
                      style={{ height: `${lateHeight}%` }}
                    />
                  </div>
                  <span className={`text-xs ${index === new Date().getDay() - 1 ? 'font-bold text-purple-600' : 'text-gray-500'}`}>
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-6 mt-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded" />
              <span className="text-xs text-gray-600">Present</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-400 rounded" />
              <span className="text-xs text-gray-600">Late</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 rounded" />
              <span className="text-xs text-gray-600">Absent</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="date"
              defaultValue={new Date().toISOString().split('T')[0]}
              className="outline-none text-sm"
            />
          </div>
          {!isEmployee && (
            <>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm">
                <option value="">All Branches</option>
                {activeBranches.map(branch => (
                  <option key={branch.id} value={branch.id}>{branch.name}</option>
                ))}
              </select>
              <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm">
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="early_leave">Early Leave</option>
              </select>
            </>
          )}
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
            <Filter size={16} />
            More Filters
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Branch
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check In
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Check Out
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hours
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">
                Source
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {todayAttendance.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-purple-700 text-sm font-medium">
                        {record.employeeName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{record.employeeName}</p>
                      <p className="text-xs text-gray-500">{record.position}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-gray-400" />
                    <span className="text-sm text-gray-900">{record.branchName}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${record.status === 'late' ? 'text-orange-600 font-medium' : 'text-gray-900'}`}>
                    {formatTime(record.checkInTime)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`text-sm ${record.status === 'early_leave' ? 'text-yellow-600 font-medium' : 'text-gray-900'}`}>
                    {formatTime(record.checkOutTime)}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {calculateHours(record.checkInTime, record.checkOutTime)}
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={record.status} />
                </td>
                <td className="px-6 py-4">
                  <SourceBadge source={record.source} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-500">
            Showing <span className="font-medium">1</span> to{' '}
            <span className="font-medium">{todayAttendance.length}</span> of{' '}
            <span className="font-medium">{todayAttendance.length}</span> records
          </p>
          <div className="flex gap-2">
            <button
              disabled
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed"
            >
              Previous
            </button>
            <button
              disabled
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-400 cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
