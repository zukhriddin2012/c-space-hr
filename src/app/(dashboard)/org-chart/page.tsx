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

function OrgCard({ node, isRoot = false, searchQuery = '' }: { node: OrgNode; isRoot?: boolean; searchQuery?: string }) {
  const [expanded, setExpanded] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const initials = node.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Color based on level
  const getBgColor = () => {
    if (node.level === 'executive' || isRoot) return 'bg-gradient-to-br from-purple-600 to-purple-700';
    if (node.level === 'senior' || node.position.toLowerCase().includes('manager') || node.position.toLowerCase().includes('chief') || node.position.toLowerCase().includes('lead')) {
      return 'bg-gradient-to-br from-blue-500 to-blue-600';
    }
    if (node.level === 'middle') return 'bg-gradient-to-br from-teal-500 to-teal-600';
    return 'bg-gradient-to-br from-gray-400 to-gray-500';
  };

  // Highlight if matches search
  const isHighlighted = searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className={`relative bg-white rounded-xl shadow-md border p-4 min-w-[200px] max-w-[240px] hover:shadow-lg transition-all duration-200 ${
          isRoot ? 'ring-2 ring-purple-200 border-purple-200' : 'border-gray-100'
        } ${isHighlighted ? 'ring-2 ring-yellow-400 border-yellow-400' : ''}`}
        onMouseEnter={() => setShowContact(true)}
        onMouseLeave={() => setShowContact(false)}
      >
        {/* Avatar */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 rounded-full ${getBgColor()} flex items-center justify-center text-white font-semibold text-sm shadow-sm overflow-hidden`}>
            {node.photo ? (
              <img src={node.photo} alt={node.name} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm truncate">{node.name}</h3>
            <p className="text-xs text-purple-600 font-medium truncate">{node.position}</p>
          </div>
        </div>

        {/* Department badge */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-2">
          <Building2 size={12} />
          <span className="truncate">{node.departmentName || node.branchName || 'No department'}</span>
        </div>

        {/* Contact buttons (show on hover) */}
        {showContact && (node.phone || node.email || node.telegramId) && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            {node.phone && (
              <a
                href={`tel:${node.phone}`}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Phone size={12} />
                <span>Call</span>
              </a>
            )}
            {node.email && (
              <a
                href={`mailto:${node.email}`}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Mail size={12} />
                <span>Email</span>
              </a>
            )}
            {node.telegramId && (
              <a
                href={`https://t.me/${node.telegramId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              >
                <MessageCircle size={12} />
                <span>TG</span>
              </a>
            )}
          </div>
        )}

        {/* Expand/collapse button */}
        {hasChildren && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-400 hover:text-purple-600 hover:border-purple-300 transition-colors shadow-sm"
          >
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        )}

        {/* Team count badge */}
        {hasChildren && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">
            {node.children!.length}
          </div>
        )}
      </div>

      {/* Connector line */}
      {hasChildren && expanded && (
        <>
          <div className="w-px h-6 bg-gray-200" />

          {/* Horizontal line */}
          {node.children!.length > 1 && (
            <div className="relative w-full flex justify-center">
              <div
                className="absolute top-0 h-px bg-gray-200"
                style={{
                  width: `calc(${(node.children!.length - 1) * 260}px)`,
                  maxWidth: '100%'
                }}
              />
            </div>
          )}

          {/* Children */}
          <div className="flex gap-4 pt-6">
            {node.children!.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {node.children!.length > 1 && <div className="w-px h-6 bg-gray-200 -mt-6" />}
                <OrgCard node={child} searchQuery={searchQuery} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Flat list view for when tree is complex
function FlatListView({ employees, searchQuery }: { employees: OrgNode[]; searchQuery: string }) {
  const filtered = searchQuery
    ? employees.filter(e =>
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.departmentName?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : employees;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {filtered.map((emp) => {
        const initials = emp.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        const manager = employees.find(e => e.id === emp.managerId);

        return (
          <div key={emp.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {emp.photo ? (
                  <img src={emp.photo} alt={emp.name} className="w-full h-full rounded-full object-cover" />
                ) : initials}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{emp.name}</h3>
                <p className="text-sm text-purple-600 truncate">{emp.position}</p>
              </div>
            </div>

            <div className="space-y-1.5 text-sm text-gray-500">
              {emp.departmentName && (
                <div className="flex items-center gap-2">
                  <Building2 size={14} className="text-gray-400" />
                  <span className="truncate">{emp.departmentName}</span>
                </div>
              )}
              {manager && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-gray-400" />
                  <span className="truncate">Reports to: {manager.name}</span>
                </div>
              )}
            </div>

            {/* Contact buttons */}
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
              {emp.phone && (
                <a href={`tel:${emp.phone}`} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                  <Phone size={12} />
                </a>
              )}
              {emp.email && (
                <a href={`mailto:${emp.email}`} className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                  <Mail size={12} />
                </a>
              )}
              {emp.telegramId && (
                <a href={`https://t.me/${emp.telegramId}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
                  <MessageCircle size={12} />
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function OrgChartPage() {
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orgTree, setOrgTree] = useState<OrgNode[]>([]);
  const [flatList, setFlatList] = useState<OrgNode[]>([]);
  const [stats, setStats] = useState<OrgStats>({ totalEmployees: 0, departments: 0, managers: 0, roots: 0 });
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetchOrgData();
    fetchDepartments();
  }, []);

  const fetchOrgData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/org-chart');
      if (!res.ok) throw new Error('Failed to fetch org data');
      const data = await res.json();
      setOrgTree(data.tree || []);
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

  // Filter tree by department
  const filterTreeByDepartment = (nodes: OrgNode[], deptId: string): OrgNode[] => {
    if (!deptId) return nodes;

    return nodes
      .map(node => ({
        ...node,
        children: node.children ? filterTreeByDepartment(node.children, deptId) : [],
      }))
      .filter(node => node.departmentId === deptId || (node.children && node.children.length > 0));
  };

  const filteredTree = departmentFilter ? filterTreeByDepartment(orgTree, departmentFilter) : orgTree;
  const filteredFlat = departmentFilter ? flatList.filter(e => e.departmentId === departmentFilter) : flatList;

  // Calculate max depth for legend
  const getMaxDepth = (nodes: OrgNode[], depth = 0): number => {
    if (!nodes.length) return depth;
    return Math.max(...nodes.map(n => n.children ? getMaxDepth(n.children, depth + 1) : depth + 1));
  };
  const maxDepth = getMaxDepth(orgTree);

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
        <p className="text-gray-500">View company structure and reporting hierarchy</p>
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

        {/* View toggle */}
        <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('tree')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'tree' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Users size={16} className="inline mr-1.5" />
            Tree View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' ? 'bg-white text-purple-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Building2 size={16} className="inline mr-1.5" />
            List View
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
          <div className="text-2xl font-bold text-purple-600">{stats.departments}</div>
          <div className="text-sm text-gray-500">Departments</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">{stats.managers}</div>
          <div className="text-sm text-gray-500">Managers</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">{maxDepth}</div>
          <div className="text-sm text-gray-500">Levels Deep</div>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'tree' ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 overflow-x-auto">
          {filteredTree.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No employees found</p>
              <p className="text-sm text-gray-400 mt-1">Set manager relationships to build the org chart</p>
            </div>
          ) : (
            <div className="flex justify-center min-w-max gap-8">
              {filteredTree.map((root) => (
                <OrgCard key={root.id} node={root} isRoot searchQuery={searchQuery} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <FlatListView employees={filteredFlat} searchQuery={searchQuery} />
      )}

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-600 to-purple-700" />
          <span>Executive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
          <span>Manager/Senior</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-teal-500 to-teal-600" />
          <span>Middle</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-500" />
          <span>Junior</span>
        </div>
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
          <div className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">3</div>
          <span>Direct reports</span>
        </div>
      </div>

      {/* Setup hint */}
      {stats.managers === 0 && stats.totalEmployees > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-sm text-blue-800">
            <strong>💡 Tip:</strong> To build the org chart hierarchy, edit each employee and set their manager.
            Go to <a href="/employees" className="underline font-medium">Employees</a> → Edit → Select Manager.
          </p>
        </div>
      )}
    </div>
  );
}
