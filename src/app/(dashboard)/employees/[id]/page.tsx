import { getSession } from '@/lib/auth-server';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import { redirect, notFound } from 'next/navigation';
import { getEmployeeById, getBranches, getAttendanceByEmployeeAndMonth } from '@/lib/db';
import EmployeeDetailClient from './EmployeeDetailClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ year?: string; month?: string }>;
}

export default async function EmployeeDetailPage({ params, searchParams }: PageProps) {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Check permission
  if (!hasPermission(user.role, PERMISSIONS.EMPLOYEES_VIEW_ALL)) {
    redirect('/dashboard');
  }

  const canViewSalary = hasPermission(user.role, PERMISSIONS.EMPLOYEES_VIEW_SALARY);
  const canEditSalary = hasPermission(user.role, PERMISSIONS.EMPLOYEES_EDIT_SALARY);
  const canEditEmployee = hasPermission(user.role, PERMISSIONS.EMPLOYEES_EDIT);

  // Get params
  const { id } = await params;
  const queryParams = await searchParams;

  // Get current year and month for default
  const now = new Date();
  const selectedYear = queryParams.year ? parseInt(queryParams.year) : now.getFullYear();
  const selectedMonth = queryParams.month ? parseInt(queryParams.month) : now.getMonth() + 1;

  // Fetch employee data
  const employee = await getEmployeeById(id);

  if (!employee) {
    notFound();
  }

  // Fetch branches and attendance data
  const [branches, monthlyAttendance] = await Promise.all([
    getBranches(),
    getAttendanceByEmployeeAndMonth(id, selectedYear, selectedMonth),
  ]);

  // Create branch map (convert to object for serialization)
  const branchMapObj: Record<string, string> = {};
  branches.forEach(b => {
    branchMapObj[b.id] = b.name;
  });

  // Calculate monthly statistics
  const totalWorkHours = monthlyAttendance.reduce((sum, a) => sum + (a.total_hours || 0), 0);
  const daysPresent = monthlyAttendance.filter(a => a.status === 'present' || a.status === 'late' || a.status === 'early_leave').length;
  const daysLate = monthlyAttendance.filter(a => a.status === 'late').length;
  const daysEarlyLeave = monthlyAttendance.filter(a => a.status === 'early_leave').length;

  const years = [2024, 2025, 2026];

  return (
    <EmployeeDetailClient
      employee={employee}
      monthlyAttendance={monthlyAttendance}
      branchMap={branchMapObj}
      totalWorkHours={totalWorkHours}
      daysPresent={daysPresent}
      daysLate={daysLate}
      daysEarlyLeave={daysEarlyLeave}
      selectedYear={selectedYear}
      selectedMonth={selectedMonth}
      years={years}
      canViewSalary={canViewSalary}
      canEditSalary={canEditSalary}
      canEditEmployee={canEditEmployee}
    />
  );
}
