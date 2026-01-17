'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, UserRole } from '@/types';
import { usePermissions } from '@/hooks/usePermissions';
import type { Permission } from '@/lib/permissions';

interface AuthContextType {
  user: User | null;
  loading: boolean;

  // Permission methods
  can: (permission: Permission) => boolean;
  canAny: (permissions: Permission[]) => boolean;
  canAll: (permissions: Permission[]) => boolean;
  isRole: (role: UserRole) => boolean;
  isAnyRole: (roles: UserRole[]) => boolean;
  canManage: (targetRole: UserRole) => boolean;

  // Role convenience flags
  isAdmin: boolean;
  isManager: boolean;
  isHR: boolean;
  isEmployee: boolean;

  // Auth methods
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser: User | null;
}

export function AuthProvider({ children, initialUser }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(initialUser);
  const [loading, setLoading] = useState(false);

  const permissions = usePermissions(user);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const value: AuthContextType = {
    user,
    loading,
    can: permissions.can,
    canAny: permissions.canAny,
    canAll: permissions.canAll,
    isRole: permissions.isRole,
    isAnyRole: permissions.isAnyRole,
    canManage: permissions.canManage,
    isAdmin: permissions.isAdmin,
    isManager: permissions.isManager,
    isHR: permissions.isHR,
    isEmployee: permissions.isEmployee,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Hook for getting just the user
export function useUser(): User | null {
  const { user } = useAuth();
  return user;
}
