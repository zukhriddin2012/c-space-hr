'use client';

import { useCallback, useMemo } from 'react';
import type { User, UserRole } from '@/types';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  canManageRole,
  getPermissionsForRole,
  Permission,
  ROLE_HIERARCHY
} from '@/lib/permissions';

interface UsePermissionsReturn {
  // Permission checks
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;

  // Role checks
  isRole: (role: UserRole) => boolean;
  isAnyRole: (roles: UserRole[]) => boolean;
  canManage: (targetRole: UserRole) => boolean;

  // User info
  role: UserRole;
  permissions: Permission[];
  roleLevel: number;

  // Utility
  isAdmin: boolean;
  isManager: boolean;
  isHR: boolean;
  isEmployee: boolean;
}

export function usePermissions(user: User | null): UsePermissionsReturn {
  const role = user?.role ?? 'employee';

  const permissions = useMemo(() => {
    return getPermissionsForRole(role);
  }, [role]);

  const roleLevel = useMemo(() => {
    return ROLE_HIERARCHY[role] ?? 0;
  }, [role]);

  const can = useCallback((permission: Permission) => {
    return hasPermission(role, permission);
  }, [role]);

  const canAny = useCallback((perms: Permission[]) => {
    return hasAnyPermission(role, perms);
  }, [role]);

  const canAll = useCallback((perms: Permission[]) => {
    return hasAllPermissions(role, perms);
  }, [role]);

  const isRole = useCallback((targetRole: UserRole) => {
    return role === targetRole;
  }, [role]);

  const isAnyRole = useCallback((roles: UserRole[]) => {
    return roles.includes(role);
  }, [role]);

  const canManage = useCallback((targetRole: UserRole) => {
    return canManageRole(role, targetRole);
  }, [role]);

  // Convenience flags
  const isAdmin = role === 'general_manager';
  const isManager = ['general_manager', 'ceo'].includes(role);
  const isHR = ['general_manager', 'hr'].includes(role);
  const isEmployee = role === 'employee';

  return {
    can,
    canAny,
    canAll,
    isRole,
    isAnyRole,
    canManage,
    role,
    permissions,
    roleLevel,
    isAdmin,
    isManager,
    isHR,
    isEmployee,
  };
}
