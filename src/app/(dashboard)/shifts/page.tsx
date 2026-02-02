import { getSession } from '@/lib/auth-server';
import { redirect } from 'next/navigation';
import { hasPermission, PERMISSIONS } from '@/lib/permissions';
import ShiftsPageClient from './ShiftsPageClient';

export default async function ShiftsPage() {
  const user = await getSession();

  if (!user) {
    redirect('/login');
  }

  // Check if user has permission to view shifts
  if (!hasPermission(user.role, PERMISSIONS.SHIFTS_VIEW)) {
    redirect('/dashboard');
  }

  // Branch managers should see only their branch
  const canViewAll = hasPermission(user.role, PERMISSIONS.SHIFTS_VIEW_ALL);
  const canEdit = hasPermission(user.role, PERMISSIONS.SHIFTS_EDIT);
  const canEditOwnBranch = hasPermission(user.role, PERMISSIONS.SHIFTS_EDIT_OWN_BRANCH);
  const canPublish = hasPermission(user.role, PERMISSIONS.SHIFTS_PUBLISH);

  // If branch manager, redirect to their branch-specific view
  if (!canViewAll && user.branchId) {
    redirect(`/shifts/${user.branchId}`);
  }

  return (
    <ShiftsPageClient
      branchFilter={canViewAll ? undefined : user.branchId}
      canEdit={canEdit}
      canPublish={canPublish}
    />
  );
}
