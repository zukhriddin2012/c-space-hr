'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Search, User, Star, Loader2, AlertCircle, Building2, Check, Home } from 'lucide-react';

export interface AvailableEmployee {
  id: string;
  full_name: string;
  position: string;
  is_floater: boolean;
  primary_branch_id: string | null;
  branch_name: string | null;
}

interface EmployeeSelectorProps {
  date: string;
  shiftType: 'day' | 'night';
  branchId: string;
  onToggle: (employee: AvailableEmployee) => void;
  selectedIds: string[];
  isAdmin?: boolean;
}

export default function EmployeeSelector({
  date,
  shiftType,
  branchId,
  onToggle,
  selectedIds,
  isAdmin = false,
}: EmployeeSelectorProps) {
  const [employees, setEmployees] = useState<AvailableEmployee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchEmployees = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          date,
          shift_type: shiftType,
          branch_id: branchId,
        });
        const res = await fetch(`/api/shifts/available-employees?${params}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to fetch');
        }
        const data = await res.json();
        setEmployees(data.employees || []);
      } catch (err) {
        console.error('Error fetching available employees:', err);
        setError(err instanceof Error ? err.message : 'Failed to load employees');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, [date, shiftType, branchId]);

  // Filter employees by search
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) =>
      emp.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [employees, searchQuery]);

  // Group employees by branch for admin view
  const branchGroups = useMemo(() => {
    if (!isAdmin) return null;

    const groups: Record<string, { branchName: string; isHome: boolean; employees: AvailableEmployee[] }> = {};

    filteredEmployees.forEach(emp => {
      const key = emp.primary_branch_id || 'unknown';
      if (!groups[key]) {
        groups[key] = {
          branchName: emp.branch_name || 'Unknown',
          isHome: key === branchId,
          employees: [],
        };
      }
      groups[key].employees.push(emp);
    });

    // Sort: home branch first, then alphabetical
    return Object.entries(groups).sort(([, a], [, b]) => {
      if (a.isHome && !b.isHome) return -1;
      if (!a.isHome && b.isHome) return 1;
      return a.branchName.localeCompare(b.branchName);
    });
  }, [filteredEmployees, branchId, isAdmin]);

  // Flat sorted list for non-admin view
  const sortedEmployees = useMemo(() => {
    if (isAdmin) return filteredEmployees; // Admin uses grouped view

    return [...filteredEmployees].sort((a, b) => {
      const aIsBranch = a.primary_branch_id === branchId;
      const bIsBranch = b.primary_branch_id === branchId;

      if (aIsBranch && !bIsBranch) return -1;
      if (!aIsBranch && bIsBranch) return 1;

      if (a.is_floater && !b.is_floater) return -1;
      if (!a.is_floater && b.is_floater) return 1;

      return a.full_name.localeCompare(b.full_name);
    });
  }, [filteredEmployees, branchId, isAdmin]);

  const renderEmployeeRow = (employee: AvailableEmployee, isCrossBranch: boolean) => {
    const isSelected = selectedIds.includes(employee.id);
    return (
      <button
        key={employee.id}
        type="button"
        onClick={() => onToggle(employee)}
        className={`w-full flex items-center gap-3 p-3 text-left hover:bg-purple-50 transition-colors ${
          isSelected ? 'bg-purple-50' : ''
        }`}
      >
        {/* Checkbox */}
        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
          isSelected
            ? 'bg-purple-600 border-purple-600'
            : 'border-gray-300 bg-white'
        }`}>
          {isSelected && (
            <Check className="w-3 h-3 text-white" />
          )}
        </div>

        <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
          <User className="h-5 w-5 text-gray-500" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">
              {employee.full_name}
            </span>
            {!isCrossBranch && employee.primary_branch_id === branchId && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700" title="This branch">
                <Building2 className="h-3 w-3 mr-0.5" />
                Branch
              </span>
            )}
            {isCrossBranch && employee.branch_name && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-teal-100 text-teal-700" title={`From ${employee.branch_name}`}>
                <Home className="h-3 w-3 mr-0.5" />
                {employee.branch_name}
              </span>
            )}
            {employee.is_floater && (
              <span title="Floater" className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">
                <Star className="h-3 w-3 mr-0.5" />
                Floater
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{employee.position}</p>
        </div>
      </button>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
        <span className="ml-2 text-gray-500">Loading available employees...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8 text-red-600">
        <AlertCircle className="h-5 w-5 mr-2" />
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        />
      </div>

      {/* Employee List */}
      <div className="max-h-[300px] overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
        {filteredEmployees.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            {searchQuery ? 'No employees match your search' : 'No available employees for this shift'}
          </div>
        ) : branchGroups ? (
          /* Admin: grouped by branch */
          branchGroups.map(([branchKey, group]) => (
            <React.Fragment key={branchKey}>
              <div className={`sticky top-0 z-10 px-3 py-1.5 border-b ${
                group.isHome
                  ? 'bg-purple-50 border-purple-100'
                  : 'bg-teal-50 border-teal-100'
              }`}>
                <span className={`text-xs font-semibold flex items-center gap-1.5 ${
                  group.isHome ? 'text-purple-700' : 'text-teal-700'
                }`}>
                  {group.isHome ? (
                    <Building2 className="h-3 w-3" />
                  ) : (
                    <Home className="h-3 w-3" />
                  )}
                  {group.branchName}{group.isHome ? ' — Home' : ''}
                  <span className="text-[10px] font-normal ml-1">
                    ({group.employees.length})
                  </span>
                </span>
              </div>
              {group.employees.map(emp => renderEmployeeRow(emp, !group.isHome))}
            </React.Fragment>
          ))
        ) : (
          /* Non-admin: flat list */
          sortedEmployees.map(emp => renderEmployeeRow(emp, false))
        )}
      </div>

      {/* Summary */}
      <p className="text-xs text-gray-500">
        {selectedIds.length > 0 && (
          <span className="font-medium text-purple-700 mr-2">
            {selectedIds.length} selected
          </span>
        )}
        {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} available
        {isAdmin && branchGroups && branchGroups.length > 1 && (
          <span className="ml-2 text-teal-600">
            ({branchGroups.length} branches)
          </span>
        )}
        {employees.some(e => e.is_floater) && (
          <span className="ml-2">
            <Star className="inline h-3 w-3 text-amber-500" /> = Floater
          </span>
        )}
      </p>
    </div>
  );
}
