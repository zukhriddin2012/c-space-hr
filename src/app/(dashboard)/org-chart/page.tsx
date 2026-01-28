'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, User, Users, Building2, Phone, Mail, MessageCircle, Search, Loader2, AlertCircle } from 'lucide-react';

interface OrgNode {
  id: string;
  employeeId: string;
  name: string;
  position: string;
  email?: string;
  phone?: string;
  telegramId?: string;
  photo?: string;
  level: string;
  managerId?: string;
  departmentId?: string;
  departmentName?: string;
  branchId?: string;
  branchName?: string;
  children?: OrgNode[];
}

interface OrgStats {
  totalEmployees: number;
  departments: number;
  managers: number;
  roots: number;
}

// Department color mapping
const getDepartmentColor = (index: number) => {
  const colors = [
    { bg: 'bg-blue-50', border: 'border-blue-100', header: 'bg-blue-500', badge: 'bg-blue-100 text-blue-700', avatar: 'bg-blue-500' },
    { bg: 'bg-amber-50', border: 'border-amber-100', header: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700', avatar: 'bg-amber-500' },
    { bg: 'bg-green-50', border: 'border-green-100', header: 'bg-green-500', badge: 'bg-green-100 text-green-700', avatar: 'bg-green-500' },
    { bg: 'bg-purple-50', border: 'border-purple-100', header: 'bg-purple-500', badge: 'bg-purple-100 text-purple-700', avatar: 'bg-purple-500' },
    { bg: 'bg-rose-50', border: 'border-rose-100', header: 'bg-rose-500', badge: 'bg-rose-100 text-rose-700', avatar: 'bg-rose-500' },
    { bg: 'bg-cyan-50', border: 'border-cyan-100', header: 'bg-cyan-500', badge: 'bg-cyan-100 text-cyan-700', avatar: 'bg-cyan-500' },
    { bg: 'bg-indigo-50', border: 'border-indigo-100', header: 'bg-indigo-500', badge: 'bg-indigo-100 text-indigo-700', avatar: 'bg-indigo-500' },
    { bg: 'bg-orange-50', border: 'border-orange-100', header: 'bg-orange-500', badge: 'bg-orange-100 text-orange-700', avatar: 'bg-orange-500' },
  ];
  return colors[index % colors.length];
};

// Employee Card Component
function EmployeeCard({
  employee,
  colorScheme,
  searchQuery,
  allEmployees
}: {
  employee: OrgNode;
  colorScheme: ReturnType<typeof getDepartmentColor>;
  searchQuery: string;
  allEmployees: OrgNode[];
}) {
  const [showContact, setShowContact] = useState(false);

  const initials = employee.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isHighlighted = searchQuery && employee.name.toLowerCase().includes(searchQuery.toLowerCase());
  const directReports = allEmployees.filter(e => e.managerId === employee.id).length;

  return (
    <div
      className={`flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer ${
        isHighlighted ? 'bg-yellow-50 ring-2 ring-yellow-300' : ''
      }`}
      onMouseEnter={() => setShowContact(true)}
      onMouseLeave={() => setShowContact(false)}
    >
      <div className={`w-10 h-10 ${colorScheme.avatar} rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
        {employee.photo ? (
          <img src={employee.photo} alt={employee.name} className="w-full h-full rounded-full object-cover" />
        ) : initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 truncate">{employee.name}</span>
          {directReports > 0 && (
            <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">{directReports}</span>
          )}
        </div>
        <div className="text-xs text-gray-500 truncate">{employee.position}</div>
      </div>

      {/* Contact buttons on hover */}
      {showContact && (employee.phone || employee.email || employee.telegramId) && (
        <div className="flex items-center gap-1">
          {employee.phone && (
            <a href={`tel:${employee.phone}`} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
              <Phone size={14} />
            </a>
          )}
          {employee.email && (
            <a href={`mailto:${employee.email}`} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors">
              <Mail size={14} />
            </a>
          )}
          {employee.telegramId && (
            <a href={`https://t.me/${employee.telegramId}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors">
              <MessageCircle size={14} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

// Department Card Component
function DepartmentCard({
  departmentName,
  employees,
  colorScheme,
  searchQuery,
  allEmployees,
  isExpanded,
  onToggle
}: {
  departmentName: string;
  employees: OrgNode[];
  colorScheme: ReturnType<typeof getDepartmentColor>;
  searchQuery: string;
  allEmployees: OrgNode[];
  isExpanded: boolean;
  onToggle: () => void;
}) {
  // Sort employees: managers first, then by name
  const sortedEmployees = [...employees].sort((a, b) => {
    const aIsManager = allEmployees.some(e => e.managerId === a.id);
    const bIsManager = allEmployees.some(e => e.managerId === b.id);
    if (aIsManager && !bIsManager) return -1;
    if (!aIsManager && bIsManager) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <div className={`bg-white rounded-xl border ${colorScheme.border} overflow-hidden shadow-sm hover:shadow-md transition-shadow`}>
      <button
        onClick={onToggle}
        className={`w-full ${colorScheme.bg} px-4 py-3 border-b ${colorScheme.border} flex items-center justify-between hover:brightness-95 transition-all`}
      >
        <div className="flex items-center gap-2">
          {isExpanded ? <ChevronDown size={16} className="text-gray-500" /> : <ChevronRight size={16} className="text-gray-500" />}
          <Building2 size={16} className="text-gray-500" />
          <span className="font-medium text-gray-900">{departmentName}</span>
        </div>
        <span className={`text-xs ${colorScheme.badge} px-2 py-0.5 rounded-full font-medium`}>
          {employees.length}
        </span>
      </button>

      {isExpanded && (
        <div className="p-2 max-h-[400px] overflow-y-auto">
          {sortedEmployees.map(emp => (
            <EmployeeCard
              key={emp.id}
              employee={emp}
              colorScheme={colorScheme}
              searchQuery={searchQuery}
              allEmployees={allEmployees}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Leadership Card Component
function LeadershipCard({
  leaders,
  searchQuery,
  allEmployees
}: {
  leaders: OrgNode[];
  searchQuery: string;
  allEmployees: OrgNode[];
}) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
        <Users size={14} />
        Leadership
      </h3>
      <div className="flex flex-wrap gap-3">
        {leaders.map(leader => {
          const initials = leader.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
          const directReports = allEmployees.filter(e => e.managerId === leader.id).length;
          const isHighlighted = searchQuery && leader.name.toLowerCase().includes(searchQuery.toLowerCase());

          return (
            <div
              key={leader.id}
              className={`bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-xl px-4 py-3 flex items-center gap-3 shadow-lg hover:shadow-xl transition-shadow ${
                isHighlighted ? 'ring-2 ring-yellow-400' : ''
              }`}
            >
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-bold">
                {leader.photo ? (
                  <img src={leader.photo} alt={leader.name} className="w-full h-full rounded-full object-cover" />
                ) : initials}
              </div>
              <div>
                <div className="font-semibold">{leader.name}</div>
                <div className="text-purple-200 text-sm">{leader.position}</div>
              </div>
              {directReports > 0 && (
                <div className="ml-2 bg-white/20 px-2.5 py-1 rounded-lg text-center">
                  <div className="text-lg font-bold">{directReports}</div>
                  <div className="text-xs text-purple-200">reports</div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function OrgChartPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flatList, setFlatList] = useState<OrgNode[]>([]);
  const [stats, setStats] = useState<OrgStats>({ totalEmployees: 0, departments: 0, managers: 0, roots: 0 });
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchOrgData();
    fetchDepartments();
  }, []);

  // Auto-expand all departments on load
  useEffect(() => {
    if (flatList.length > 0) {
      const allDeptNames = new Set(flatList.map(e => e.departmentName || 'No Department'));
      setExpandedDepts(allDeptNames);
    }
  }, [flatList]);

  const fetchOrgData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/org-chart');
      if (!res.ok) throw new Error('Failed to fetch org data');
      const data = await res.json();
      setFlatList(data.flat || []);
      setStats(data.stats || { totalEmployees: 0, departments: 0, managers: 0, roots: 0 });
    } catch (err) {
      setError('Failed to load organization data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        setDepartments(data || []);
      }
    } catch (err) {
      console.error('Failed to fetch departments:', err);
    }
  };

  const toggleDepartment = (deptName: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(deptName)) {
        next.delete(deptName);
      } else {
        next.add(deptName);
      }
      return next;
    });
  };

  // Filter employees by search and department
  const filteredEmployees = flatList.filter(emp => {
    const matchesSearch = !searchQuery ||
      emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.position.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = !departmentFilter || emp.departmentId === departmentFilter;
    return matchesSearch && matchesDept;
  });

  // Group by department
  const groupedByDepartment = filteredEmployees.reduce((acc, emp) => {
    const deptName = emp.departmentName || 'No Department';
    if (!acc[deptName]) acc[deptName] = [];
    acc[deptName].push(emp);
    return acc;
  }, {} as Record<string, OrgNode[]>);

  // Identify leadership (people with no manager or top-level executives)
  const leaders = flatList.filter(emp =>
    !emp.managerId ||
    emp.level?.toLowerCase() === 'executive' ||
    emp.position?.toLowerCase().includes('ceo') ||
    emp.position?.toLowerCase().includes('coo') ||
    emp.position?.toLowerCase().includes('cfo')
  );

  // Non-leadership employees grouped by department
  const nonLeadersByDept = Object.entries(groupedByDepartment)
    .map(([name, employees]) => ({
      name,
      employees: employees.filter(e => !leaders.some(l => l.id === e.id))
    }))
    .filter(d => d.employees.length > 0)
    .sort((a, b) => b.employees.length - a.employees.length);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
          <p className="text-gray-500">Loading organization chart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-8 h-8 text-red-500" />
          <p className="text-gray-700">{error}</p>
          <button
            onClick={fetchOrgData}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Organization Chart</h1>
        <p className="text-gray-500">View company structure by department</p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>

          {/* Department filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All Departments</option>
            {departments.map(dept => (
              <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
          </select>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpandedDepts(new Set(Object.keys(groupedByDepartment)))}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            Expand All
          </button>
          <button
            onClick={() => setExpandedDepts(new Set())}
            className="px-3 py-1.5 text-sm text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">{stats.totalEmployees}</div>
          <div className="text-sm text-gray-500">Total Employees</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">{Object.keys(groupedByDepartment).length}</div>
          <div className="text-sm text-gray-500">Departments</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{stats.managers}</div>
          <div className="text-sm text-gray-500">Managers</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{leaders.length}</div>
          <div className="text-sm text-gray-500">Leadership</div>
        </div>
      </div>

      {/* Leadership Section */}
      {leaders.length > 0 && !departmentFilter && (
        <LeadershipCard
          leaders={leaders}
          searchQuery={searchQuery}
          allEmployees={flatList}
        />
      )}

      {/* Departments Grid */}
      {nonLeadersByDept.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No employees found</p>
          {searchQuery && (
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {nonLeadersByDept.map(({ name, employees }, index) => (
            <DepartmentCard
              key={name}
              departmentName={name}
              employees={employees}
              colorScheme={getDepartmentColor(index)}
              searchQuery={searchQuery}
              allEmployees={flatList}
              isExpanded={expandedDepts.has(name)}
              onToggle={() => toggleDepartment(name)}
            />
          ))}
        </div>
      )}

      {/* Setup hint */}
      {stats.totalEmployees > 0 && Object.keys(groupedByDepartment).length <= 1 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> Assign employees to departments to see them grouped here.
            Go to <a href="/employees" className="underline font-medium">Employees</a> → Edit → Select Department.
          </p>
        </div>
      )}
    </div>
  );
}
