import { getSession } from '@/lib/auth-server';
import { hasPermission } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getBranches, getEmployees, getTodayAttendance } from '@/lib/db';
import BranchesClient from './BranchesClient';

export interface BranchWithStats {
  id: string;
  name: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  geofence_radius: number;
  isActive: boolean;
  totalEmployees: number;
  presentToday: number;
  salaryBudget: number;
}

// Fetch branch data with employee counts
async function getBranchesWithStats(): Promise<BranchWithStats[]> {
  const [branches, employees, attendance] = await Promise.all([
    getBranches(),
    getEmployees(),
    getTodayAttendance(),
  ]);

  return branches.map(branch => {
    const branchEmployees = employees.filter(e => e.branch_id === branch.id);
    const salaryBudget = branchEmployees.reduce((sum, e) => sum + (e.salary || 0), 0);
    const presentToday = attendance.filter(a => a.check_in_branch_id === branch.id).length;

    return {
      ...branch,
      isActive: branchEmployees.length > 0,
      totalEmployees: branchEmployees.length,
      presentToday,
      salaryBudget,
    };
  });
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

  // Fetch real branch data from Supabase
  const branchesWithStats = await getBranchesWithStats();

  // Sort: branches with employees first, then by name
  const sortedBranches = [...branchesWithStats].sort((a, b) => {
    if (a.totalEmployees > 0 && b.totalEmployees === 0) return -1;
    if (a.totalEmployees === 0 && b.totalEmployees > 0) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <BranchesClient
      branches={sortedBranches}
      canManageBranches={canManageBranches}
      canViewSalaries={canViewSalaries}
    />
  );
}
