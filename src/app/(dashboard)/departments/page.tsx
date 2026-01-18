'use client';

import { useState } from 'react';
import {
  Building2,
  Users,
  Plus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  ChevronRight,
  Briefcase,
  DollarSign,
  TrendingUp
} from 'lucide-react';

interface Department {
  id: string;
  name: string;
  description: string;
  headCount: number;
  budget: string;
  manager: string;
  color: string;
  growth: number;
}

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Operations',
    description: 'Day-to-day business operations and customer service',
    headCount: 28,
    budget: '168,000,000 UZS',
    manager: 'Sardor Karimov',
    color: 'bg-blue-500',
    growth: 12
  },
  {
    id: '2',
    name: 'Human Resources',
    description: 'Employee management, recruitment, and development',
    headCount: 5,
    budget: '45,000,000 UZS',
    manager: 'Zuxriddin Abduraxmonov',
    color: 'bg-purple-500',
    growth: 0
  },
  {
    id: '3',
    name: 'Finance',
    description: 'Financial planning, accounting, and budgeting',
    headCount: 4,
    budget: '36,000,000 UZS',
    manager: 'Jasur Toshmatov',
    color: 'bg-green-500',
    growth: -5
  },
  {
    id: '4',
    name: 'Marketing',
    description: 'Brand management, advertising, and promotions',
    headCount: 6,
    budget: '54,000,000 UZS',
    manager: 'Malika Yusupova',
    color: 'bg-orange-500',
    growth: 20
  },
  {
    id: '5',
    name: 'IT & Development',
    description: 'Technology infrastructure and software development',
    headCount: 8,
    budget: '96,000,000 UZS',
    manager: 'Bekzod Rahimov',
    color: 'bg-cyan-500',
    growth: 15
  },
  {
    id: '6',
    name: 'Administration',
    description: 'Executive support and office management',
    headCount: 5,
    budget: '40,000,000 UZS',
    manager: 'Nilufar Azimova',
    color: 'bg-pink-500',
    growth: 0
  },
];

export default function DepartmentsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const totalEmployees = mockDepartments.reduce((sum, d) => sum + d.headCount, 0);
  const filteredDepartments = mockDepartments.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.manager.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600 mt-1">Manage organizational structure and departments</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus size={18} />
          Add Department
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Building2 size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{mockDepartments.length}</p>
              <p className="text-sm text-gray-500">Total Departments</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Users size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalEmployees}</p>
              <p className="text-sm text-gray-500">Total Employees</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-50 rounded-lg">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">339.3M UZS</p>
              <p className="text-sm text-gray-500">Total Monthly Budget</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and View Toggle */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search departments or managers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-purple-50 text-purple-600' : 'text-gray-400'}`}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5v3A1.5 1.5 0 0 1 5.5 7h-3A1.5 1.5 0 0 1 1 5.5v-3zM2.5 2a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5v3A1.5 1.5 0 0 1 13.5 7h-3A1.5 1.5 0 0 1 9 5.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zM1 10.5A1.5 1.5 0 0 1 2.5 9h3A1.5 1.5 0 0 1 7 10.5v3A1.5 1.5 0 0 1 5.5 15h-3A1.5 1.5 0 0 1 1 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3zm6.5.5A1.5 1.5 0 0 1 10.5 9h3a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-3A1.5 1.5 0 0 1 9 13.5v-3zm1.5-.5a.5.5 0 0 0-.5.5v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3z"/>
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-purple-50 text-purple-600' : 'text-gray-400'}`}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path fillRule="evenodd" d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Departments Grid/List */}
        <div className="p-4">
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="border border-gray-200 rounded-xl p-5 hover:border-purple-200 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 ${dept.color} rounded-xl flex items-center justify-center`}>
                      <Building2 size={24} className="text-white" />
                    </div>
                    <button className="p-1 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreVertical size={18} />
                    </button>
                  </div>

                  <h3 className="font-semibold text-gray-900 mb-1">{dept.name}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{dept.description}</p>

                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span className="flex items-center gap-1">
                      <Users size={14} className="text-gray-400" />
                      {dept.headCount} employees
                    </span>
                    <span className="flex items-center gap-1">
                      {dept.growth > 0 ? (
                        <TrendingUp size={14} className="text-green-500" />
                      ) : dept.growth < 0 ? (
                        <TrendingUp size={14} className="text-red-500 rotate-180" />
                      ) : (
                        <span className="w-3.5 h-0.5 bg-gray-300 rounded" />
                      )}
                      <span className={dept.growth > 0 ? 'text-green-600' : dept.growth < 0 ? 'text-red-600' : 'text-gray-500'}>
                        {dept.growth > 0 ? '+' : ''}{dept.growth}%
                      </span>
                    </span>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">
                          {dept.manager.charAt(0)}
                        </span>
                      </div>
                      <span className="text-sm text-gray-600">{dept.manager}</span>
                    </div>
                    <ChevronRight size={16} className="text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDepartments.map((dept) => (
                <div
                  key={dept.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-200 hover:bg-purple-50/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 ${dept.color} rounded-lg flex items-center justify-center`}>
                      <Building2 size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{dept.name}</h3>
                      <p className="text-sm text-gray-500">Managed by {dept.manager}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{dept.headCount}</p>
                      <p className="text-xs text-gray-500">Employees</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{dept.budget}</p>
                      <p className="text-xs text-gray-500">Monthly Budget</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <Edit size={16} />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
