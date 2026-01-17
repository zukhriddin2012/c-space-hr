'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Filter, Search } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
}

interface AttendanceFiltersProps {
  branches: Branch[];
  isEmployee: boolean;
}

export default function AttendanceFilters({ branches, isEmployee }: AttendanceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [date, setDate] = useState(searchParams.get('date') || new Date().toISOString().split('T')[0]);
  const [branch, setBranch] = useState(searchParams.get('branch') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  const handleApply = () => {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (branch) params.set('branch', branch);
    if (status) params.set('status', status);

    router.push(`/attendance?${params.toString()}`);
  };

  const handleReset = () => {
    setDate(new Date().toISOString().split('T')[0]);
    setBranch('');
    setStatus('');
    router.push('/attendance');
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg">
            <Calendar size={18} className="text-gray-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="outline-none text-sm"
            />
          </div>
        </div>

        {!isEmployee && (
          <>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Branch</label>
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm min-w-[180px]"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none text-sm min-w-[140px]"
              >
                <option value="">All Status</option>
                <option value="present">Present</option>
                <option value="late">Late</option>
                <option value="absent">Absent</option>
                <option value="early_leave">Early Leave</option>
              </select>
            </div>
          </>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <Search size={16} />
            Apply
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
