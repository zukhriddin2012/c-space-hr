'use client';

import { useState } from 'react';
import { ChevronDown, ChevronRight, User, Users, Building2, Phone, Mail, MessageCircle } from 'lucide-react';

// Mock data to visualize the org chart design
const mockOrgData = {
  id: '1',
  name: 'Zuxriddin Abduraxmonov',
  position: 'General Manager',
  department: 'Management',
  avatar: null,
  phone: '+998 90 123 4567',
  email: 'zuxriddin@cspace.uz',
  children: [
    {
      id: '2',
      name: 'Ruxshona Karimova',
      position: 'HR Manager',
      department: 'Human Resources',
      avatar: null,
      phone: '+998 90 234 5678',
      email: 'ruxshona@cspace.uz',
      children: [
        {
          id: '5',
          name: 'Malika Tosheva',
          position: 'Recruiter',
          department: 'Human Resources',
          avatar: null,
          children: [],
        },
        {
          id: '6',
          name: 'Jasur Aliyev',
          position: 'HR Specialist',
          department: 'Human Resources',
          avatar: null,
          children: [],
        },
      ],
    },
    {
      id: '3',
      name: 'Bobur Rahimov',
      position: 'Chief Accountant',
      department: 'Finance',
      avatar: null,
      phone: '+998 90 345 6789',
      email: 'bobur@cspace.uz',
      children: [
        {
          id: '7',
          name: 'Nilufar Saidova',
          position: 'Accountant',
          department: 'Finance',
          avatar: null,
          children: [],
        },
      ],
    },
    {
      id: '4',
      name: 'Aziza Yusupova',
      position: 'Operations Manager',
      department: 'Operations',
      avatar: null,
      phone: '+998 90 456 7890',
      email: 'aziza@cspace.uz',
      children: [
        {
          id: '8',
          name: 'Sardor Tursunov',
          position: 'Branch Manager',
          department: 'Chilanzar Branch',
          avatar: null,
          children: [
            { id: '11', name: 'Dilshod Karimov', position: 'Sales Rep', department: 'Chilanzar Branch', avatar: null, children: [] },
            { id: '12', name: 'Gulnora Azimova', position: 'Sales Rep', department: 'Chilanzar Branch', avatar: null, children: [] },
          ],
        },
        {
          id: '9',
          name: 'Kamola Rashidova',
          position: 'Branch Manager',
          department: 'Yunusabad Branch',
          avatar: null,
          children: [
            { id: '13', name: 'Bekzod Umarov', position: 'Sales Rep', department: 'Yunusabad Branch', avatar: null, children: [] },
          ],
        },
        {
          id: '10',
          name: 'Temur Nazarov',
          position: 'Branch Manager',
          department: 'Sergeli Branch',
          avatar: null,
          children: [],
        },
      ],
    },
  ],
};

interface OrgNode {
  id: string;
  name: string;
  position: string;
  department: string;
  avatar: string | null;
  phone?: string;
  email?: string;
  children: OrgNode[];
}

function OrgCard({ node, isRoot = false }: { node: OrgNode; isRoot?: boolean }) {
  const [expanded, setExpanded] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const initials = node.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Color based on level/role
  const getBgColor = () => {
    if (isRoot) return 'bg-gradient-to-br from-purple-600 to-purple-700';
    if (node.position.includes('Manager') || node.position.includes('Chief')) return 'bg-gradient-to-br from-blue-500 to-blue-600';
    return 'bg-gradient-to-br from-gray-400 to-gray-500';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Card */}
      <div
        className={`relative bg-white rounded-xl shadow-md border border-gray-100 p-4 min-w-[200px] max-w-[240px] hover:shadow-lg transition-all duration-200 ${isRoot ? 'ring-2 ring-purple-200' : ''}`}
        onMouseEnter={() => setShowContact(true)}
        onMouseLeave={() => setShowContact(false)}
      >
        {/* Avatar */}
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-12 h-12 rounded-full ${getBgColor()} flex items-center justify-center text-white font-semibold text-sm shadow-sm`}>
            {node.avatar ? (
              <img src={node.avatar} alt={node.name} className="w-full h-full rounded-full object-cover" />
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
          <span className="truncate">{node.department}</span>
        </div>

        {/* Contact buttons (show on hover) */}
        {showContact && (node.phone || node.email) && (
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
            {node.phone && (
              <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                <Phone size={12} />
                <span>Call</span>
              </button>
            )}
            {node.email && (
              <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <Mail size={12} />
                <span>Email</span>
              </button>
            )}
            <button className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors">
              <MessageCircle size={12} />
              <span>TG</span>
            </button>
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
            {node.children.length}
          </div>
        )}
      </div>

      {/* Connector line */}
      {hasChildren && expanded && (
        <>
          <div className="w-px h-6 bg-gray-200" />

          {/* Horizontal line */}
          {node.children.length > 1 && (
            <div className="relative w-full flex justify-center">
              <div
                className="absolute top-0 h-px bg-gray-200"
                style={{
                  width: `calc(${(node.children.length - 1) * 260}px)`,
                  maxWidth: '100%'
                }}
              />
            </div>
          )}

          {/* Children */}
          <div className="flex gap-4 pt-6">
            {node.children.map((child) => (
              <div key={child.id} className="flex flex-col items-center">
                {node.children.length > 1 && <div className="w-px h-6 bg-gray-200 -mt-6" />}
                <OrgCard node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Organization Chart</h1>
        <p className="text-gray-500">View company structure and reporting hierarchy</p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-64 pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          </div>

          {/* Department filter */}
          <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500">
            <option value="">All Departments</option>
            <option value="hr">Human Resources</option>
            <option value="finance">Finance</option>
            <option value="operations">Operations</option>
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
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900">13</div>
          <div className="text-sm text-gray-500">Total Employees</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-purple-600">4</div>
          <div className="text-sm text-gray-500">Departments</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600">5</div>
          <div className="text-sm text-gray-500">Managers</div>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600">3</div>
          <div className="text-sm text-gray-500">Levels Deep</div>
        </div>
      </div>

      {/* Org Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 overflow-x-auto">
        <div className="flex justify-center min-w-max">
          <OrgCard node={mockOrgData} isRoot />
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-purple-600 to-purple-700" />
          <span>Executive</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
          <span>Manager</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-500" />
          <span>Employee</span>
        </div>
        <div className="flex items-center gap-2 ml-4 pl-4 border-l border-gray-200">
          <div className="w-5 h-5 bg-purple-100 text-purple-700 rounded-full flex items-center justify-center text-xs font-semibold">3</div>
          <span>Direct reports</span>
        </div>
      </div>

      {/* Note about mock data */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
        <p className="text-sm text-yellow-800">
          <strong>📌 Design Preview:</strong> This is a mockup with sample data.
          Once you approve the design, I'll add the <code className="bg-yellow-100 px-1 rounded">manager_id</code> field to employees
          and connect this to real data.
        </p>
      </div>
    </div>
  );
}
