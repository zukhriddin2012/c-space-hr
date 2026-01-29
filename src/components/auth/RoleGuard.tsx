'use client';

import React from 'react';
import type { UserRole } from '@/types';
import type { Permission } from '@/lib/permissions';
import { useAuth } from '@/contexts/AuthContext';
import { ShieldAlert } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  // Allow by permission
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean; // If true, requires ALL permissions; default is ANY

  // Allow by role
  role?: UserRole;
  roles?: UserRole[];

  // Fallback content when not authorized
  fallback?: React.ReactNode;
  showUnauthorized?: boolean; // Show "unauthorized" message instead of nothing
}

/**
 * Component that conditionally renders children based on user's role/permissions
 *
 * Usage examples:
 *
 * // Single permission
 * <RoleGuard permission="employees:edit">
 *   <EditButton />
 * </RoleGuard>
 *
 * // Any of multiple permissions
 * <RoleGuard permissions={['employees:edit', 'employees:delete']}>
 *   <ManageButton />
 * </RoleGuard>
 *
 * // All permissions required
 * <RoleGuard permissions={['payroll:view', 'payroll:process']} requireAll>
 *   <ProcessPayrollButton />
 * </RoleGuard>
 *
 * // By role
 * <RoleGuard roles={['general_manager', 'hr']}>
 *   <AdminPanel />
 * </RoleGuard>
 *
 * // With fallback
 * <RoleGuard permission="employees:view_salary" fallback={<LockedContent />}>
 *   <SalaryInfo />
 * </RoleGuard>
 */
export function RoleGuard({
  children,
  permission,
  permissions,
  requireAll = false,
  role,
  roles,
  fallback = null,
  showUnauthorized = false,
}: RoleGuardProps) {
  const { can, canAny, canAll, isRole, isAnyRole, user } = useAuth();

  // If no user, don't show anything
  if (!user) {
    return showUnauthorized ? <UnauthorizedMessage /> : fallback;
  }

  let isAuthorized = false;

  // Check by permission
  if (permission) {
    isAuthorized = can(permission);
  } else if (permissions && permissions.length > 0) {
    isAuthorized = requireAll ? canAll(permissions) : canAny(permissions);
  }
  // Check by role
  else if (role) {
    isAuthorized = isRole(role);
  } else if (roles && roles.length > 0) {
    isAuthorized = isAnyRole(roles);
  }
  // No restrictions specified, show children
  else {
    isAuthorized = true;
  }

  if (!isAuthorized) {
    return showUnauthorized ? <UnauthorizedMessage /> : fallback;
  }

  return <>{children}</>;
}

function UnauthorizedMessage() {
  return (
    <div className="flex items-center gap-2 p-4 bg-gray-50 border border-gray-200 rounded-lg text-gray-500">
      <ShieldAlert size={20} />
      <span className="text-sm">You don&apos;t have permission to view this content</span>
    </div>
  );
}

// HOC version for wrapping entire components
export function withRoleGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  guardProps: Omit<RoleGuardProps, 'children'>
) {
  return function GuardedComponent(props: P) {
    return (
      <RoleGuard {...guardProps}>
        <WrappedComponent {...props} />
      </RoleGuard>
    );
  };
}

// Page-level guard that shows a full unauthorized page
interface PageGuardProps {
  children: React.ReactNode;
  permission?: Permission;
  permissions?: Permission[];
  requireAll?: boolean;
  role?: UserRole;
  roles?: UserRole[];
}

export function PageGuard({
  children,
  ...guardProps
}: PageGuardProps) {
  return (
    <RoleGuard
      {...guardProps}
      showUnauthorized={false}
      fallback={<UnauthorizedPage />}
    >
      {children}
    </RoleGuard>
  );
}

function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <ShieldAlert size={32} className="text-red-600" />
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
      <p className="text-gray-600 max-w-md">
        You don&apos;t have permission to access this page. Please contact your administrator if you believe this is an error.
      </p>
    </div>
  );
}

export default RoleGuard;
