'use client';

import { ArrowLeft, User, Briefcase, MapPin, Clock, Phone, Mail, Calendar, CheckCircle, AlertCircle, XCircle, Pencil, Wifi } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';
import { EmployeeWagesSection, WageTrendChart, EmployeePayslipsSection } from '@/components/employee';

interface Employee {
  id: string;
  employee_id: string;
  full_name: string;
  position: string;
  level: string | null;
  branch_id: string | null;
  salary: number | null;
  status: string;
  phone: string | null;
  email: string | null;
  hire_date: string | null;
  remote_work_enabled?: boolean;
  branches?: { name: string } | null;
}

interface AttendanceRecord {
  id: string;
  date: string;
  check_in: string | null;
  check_out: string | null;
  status: string;
  total_hours: number | null;
  source?: string | null;
  verification_type?: string | null;
  check_in_branch_id?: string | null;
  check_in_branch?: { name: string } | null;
}

interface EmployeeDetailClientProps {
  employee: Employee;
  monthlyAttendance: AttendanceRecord[];
  branchMap: Record<string, string>;
  totalWorkHours: number;
  daysPresent: number;
  daysLate: number;
  daysEarlyLeave: number;
  selectedYear: number;
  selectedMonth: number;
  years: number[];
  canViewSalary: boolean;
  canEditSalary: boolean;
  canEditEmployee: boolean;
}

function formatSalary(amount: number): string {
  if (!amount || amount === 0) return '-';
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' UZS';
}

function formatDate(dateString: string | null): string {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(timeString: string | null): string {
  if (!timeString) return '-';
  return timeString.substring(0, 5);
}

function VerificationBadge({ source, verificationType, t }: { source: string | null | undefined; verificationType?: string | null; t: any }) {
  let badgeType = source;

  if (verificationType === 'remote') {
    badgeType = 'remote';
  } else if (verificationType === 'ip') {
    badgeType = 'web';
  } else if (verificationType === 'gps') {
    badgeType = 'telegram';
  }

  if (!badgeType) return null;

  const config: Record<string, { label: string; className: string }> = {
    web: { label: t.attendance.ip, className: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
    telegram: { label: t.attendance.gps, className: 'bg-amber-100 text-amber-700 border-amber-200' },
    manual: { label: t.attendance.manual, className: 'bg-gray-100 text-gray-600 border-gray-200' },
    remote: { label: t.attendance.remote, className: 'bg-blue-100 text-blue-700 border-blue-200' },
  };

  const badge = config[badgeType];
  if (!badge) return null;

  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${badge.className}`}>
      {badge.label}
    </span>
  );
}

function StatusBadge({ status, t }: { status: string; t: any }) {
  const statusConfig: Record<string, { label: string; className: string; icon: React.ComponentType<{ size?: number }> }> = {
    present: { label: t.attendance.present, className: 'bg-green-50 text-green-700', icon: CheckCircle },
    late: { label: t.attendance.late, className: 'bg-orange-50 text-orange-700', icon: AlertCircle },
    absent: { label: t.attendance.absent, className: 'bg-red-50 text-red-700', icon: XCircle },
    early_leave: { label: t.attendance.earlyLeave, className: 'bg-yellow-50 text-yellow-700', icon: Clock },
  };

  const config = statusConfig[status] || statusConfig.absent;
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      <Icon size={12} />
      {config.label}
    </span>
  );
}

function EmployeeStatusBadge({ status, t }: { status: string; t: any }) {
  const statusStyles: Record<string, string> = {
    active: 'bg-green-50 text-green-700',
    inactive: 'bg-gray-50 text-gray-700',
    terminated: 'bg-red-50 text-red-700',
    probation: 'bg-yellow-50 text-yellow-700',
  };

  const statusLabels: Record<string, string> = {
    active: t.employees.active,
    inactive: t.employees.inactive,
    terminated: t.employees.terminated,
    probation: t.employees.probation,
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status] || statusStyles.inactive}`}>
      {statusLabels[status] || status}
    </span>
  );
}

function LevelBadge({ level, t }: { level: string; t: any }) {
  const levelStyles: Record<string, string> = {
    junior: 'bg-blue-50 text-blue-700',
    middle: 'bg-purple-50 text-purple-700',
    senior: 'bg-indigo-50 text-indigo-700',
    executive: 'bg-pink-50 text-pink-700',
  };

  const levelLabels: Record<string, string> = {
    junior: t.employees.junior,
    middle: t.employees.middle,
    senior: t.employees.senior,
    executive: t.employees.executive,
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${levelStyles[level] || levelStyles.junior}`}>
      {levelLabels[level] || level.charAt(0).toUpperCase() + level.slice(1)}
    </span>
  );
}

export default function EmployeeDetailClient({
  employee,
  monthlyAttendance,
  branchMap,
  totalWorkHours,
  daysPresent,
  daysLate,
  daysEarlyLeave,
  selectedYear,
  selectedMonth,
  years,
  canViewSalary,
  canEditSalary,
  canEditEmployee,
}: EmployeeDetailClientProps) {
  const { t } = useTranslation();

  const months = [
    { value: 1, label: t.employees.january },
    { value: 2, label: t.employees.february },
    { value: 3, label: t.employees.march },
    { value: 4, label: t.employees.april },
    { value: 5, label: t.employees.may },
    { value: 6, label: t.employees.june },
    { value: 7, label: t.employees.july },
    { value: 8, label: t.employees.august },
    { value: 9, label: t.employees.september },
    { value: 10, label: t.employees.october },
    { value: 11, label: t.employees.november },
    { value: 12, label: t.employees.december },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/employees"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{t.employees.employeeDetails}</h1>
            <p className="text-gray-500 mt-1">{t.employees.viewEmployeeInfo}</p>
          </div>
        </div>
        {canEditEmployee && (
          <Link
            href={`/employees/${employee.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            <Pencil size={16} />
            {t.employees.editEmployee}
          </Link>
        )}
      </div>

      {/* Employee Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-start gap-6">
          <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
            <span className="text-purple-700 font-semibold text-2xl">
              {employee.full_name.charAt(0)}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-xl font-semibold text-gray-900">{employee.full_name}</h2>
              <EmployeeStatusBadge status={employee.status} t={t} />
              {employee.remote_work_enabled && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                  <Wifi size={12} />
                  {t.employees.remote}
                </span>
              )}
            </div>
            <p className="text-gray-500 mb-4">{employee.employee_id}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t.employees.position}</p>
                  <p className="font-medium text-gray-900">{employee.position}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t.employees.level}</p>
                  <LevelBadge level={employee.level || 'junior'} t={t} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t.employees.branch}</p>
                  <p className="font-medium text-gray-900">
                    {employee.branches?.name || (employee.branch_id ? branchMap[employee.branch_id] : null) || '-'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">{t.employees.hireDate}</p>
                  <p className="font-medium text-gray-900">{formatDate(employee.hire_date)}</p>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
              {employee.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={16} className="text-gray-400" />
                  <span className="text-gray-600">{employee.phone}</span>
                </div>
              )}
              {employee.email && (
                <div className="flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-600">{employee.email}</span>
                </div>
              )}
              {canViewSalary && (employee.salary ?? 0) > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">{t.employees.salary}:</span>
                  <span className="font-medium text-gray-900">{formatSalary(employee.salary ?? 0)}{t.employees.perMonth}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Wage Distribution Section - only for users who can view salary */}
      {canViewSalary && (
        <EmployeeWagesSection
          employeeId={employee.id}
          canEdit={canEditSalary}
        />
      )}

      {/* Wage Trend Chart - only for users who can view salary */}
      {canViewSalary && (
        <WageTrendChart employeeId={employee.id} />
      )}

      {/* Payslips Management Section - only for users who can view salary */}
      {canViewSalary && (
        <EmployeePayslipsSection
          employeeId={employee.id}
          canEdit={canEditSalary}
        />
      )}

      {/* Monthly Work Hours Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock size={20} className="text-purple-600" />
            {t.employees.monthlyWorkHours}
          </h3>

          {/* Month/Year Selector */}
          <form className="flex gap-2">
            <select
              name="month"
              defaultValue={selectedMonth}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </select>
            <select
              name="year"
              defaultValue={selectedYear}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
            >
              {years.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors"
            >
              {t.common.view}
            </button>
          </form>
        </div>

        {/* Monthly Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-purple-600 mb-1">{t.employees.totalHours}</p>
            <p className="text-2xl font-semibold text-purple-700">{Math.round(totalWorkHours * 10) / 10}h</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-green-600 mb-1">{t.employees.daysPresent}</p>
            <p className="text-2xl font-semibold text-green-700">{daysPresent}</p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-600 mb-1">{t.employees.daysLate}</p>
            <p className="text-2xl font-semibold text-orange-700">{daysLate}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <p className="text-sm text-yellow-600 mb-1">{t.employees.earlyLeaves}</p>
            <p className="text-2xl font-semibold text-yellow-700">{daysEarlyLeave}</p>
          </div>
        </div>

        {/* Attendance History Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.employees.date}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.employees.checkIn}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.employees.checkOut}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.employees.branch}</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.employees.hours}</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">{t.common.status}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {monthlyAttendance.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                    {t.employees.noAttendanceRecords} {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                  </td>
                </tr>
              ) : (
                monthlyAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex items-center gap-2">
                        <span className={record.status === 'late' ? 'text-orange-600 font-medium' : ''}>
                          {formatTime(record.check_in)}
                        </span>
                        <VerificationBadge source={record.source} verificationType={record.verification_type} t={t} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{formatTime(record.check_out)}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {record.check_in_branch?.name || (record.check_in_branch_id ? branchMap[record.check_in_branch_id] : null) || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                      {record.total_hours ? `${Math.min(Math.round(record.total_hours * 10) / 10, 24)}h` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={record.status} t={t} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
