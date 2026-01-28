'use client';

import { Search } from 'lucide-react';
import Link from 'next/link';
import { useTranslation } from '@/contexts/LanguageContext';

interface Branch {
  id: string;
  name: string;
}

interface EmployeesFiltersProps {
  branches: Branch[];
  selectedBranch: string;
  selectedLevel: string;
  selectedStatus: string;
  searchQuery: string;
}

export default function EmployeesFilters({
  branches,
  selectedBranch,
  selectedLevel,
  selectedStatus,
  searchQuery,
}: EmployeesFiltersProps) {
  const { t } = useTranslation();

  return (
    <form className="bg-white rounded-xl border border-gray-200 p-3 lg:p-4 mb-4 lg:mb-6">
      <div className="flex flex-col gap-3 lg:gap-4">
        {/* Search - full width on mobile */}
        <div className="w-full">
          <label className="block text-xs font-medium text-gray-500 mb-1">{t.common.search}</label>
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              name="search"
              defaultValue={searchQuery}
              placeholder={t.common.search}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Filters row */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 lg:gap-4 items-end">
          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t.employees.branch}</label>
            <select
              name="branch"
              defaultValue={selectedBranch}
              className="w-full sm:w-auto px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm sm:min-w-[140px]"
            >
              <option value="">{t.common.allBranches}</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>{branch.name}</option>
              ))}
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t.employees.level}</label>
            <select
              name="level"
              defaultValue={selectedLevel}
              className="w-full sm:w-auto px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
            >
              <option value="">{t.employees.allLevels}</option>
              <option value="junior">{t.employees.junior}</option>
              <option value="middle">{t.employees.middle}</option>
              <option value="senior">{t.employees.senior}</option>
              <option value="executive">{t.employees.executive}</option>
            </select>
          </div>

          <div className="col-span-1">
            <label className="block text-xs font-medium text-gray-500 mb-1">{t.common.status}</label>
            <select
              name="status"
              defaultValue={selectedStatus}
              className="w-full sm:w-auto px-3 lg:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm"
            >
              <option value="">{t.common.allStatus}</option>
              <option value="active">{t.employees.active}</option>
              <option value="probation">{t.employees.probation}</option>
              <option value="inactive">{t.employees.inactive}</option>
              <option value="terminated">{t.employees.terminated}</option>
            </select>
          </div>

          <div className="col-span-1 flex gap-2">
            <button
              type="submit"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 lg:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
            >
              <Search size={16} />
              <span className="hidden sm:inline">{t.common.apply}</span>
            </button>
            <Link
              href="/employees"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-3 lg:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              {t.common.reset}
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
