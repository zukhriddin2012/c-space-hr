'use client';

import { useState, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Branch {
  id: string;
  name: string;
}

interface AttendanceFiltersProps {
  branches: Branch[];
  isEmployee: boolean;
}

// Helper to format date for display
function formatDateDisplay(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  });
}

// Get quick date options
function getQuickDates() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

  return {
    today: today.toISOString().split('T')[0],
    yesterday: yesterday.toISOString().split('T')[0],
    weekAgo: weekAgo.toISOString().split('T')[0],
    monthStart: monthStart.toISOString().split('T')[0],
  };
}

export default function AttendanceFilters({ branches, isEmployee }: AttendanceFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const quickDates = useMemo(() => getQuickDates(), []);

  const [date, setDate] = useState(searchParams.get('date') || quickDates.today);
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
    setDate(quickDates.today);
    setBranch('');
    setStatus('');
    router.push('/attendance');
  };

  // Navigate to previous/next day
  const navigateDay = (direction: 'prev' | 'next') => {
    const currentDate = new Date(date + 'T00:00:00');
    if (direction === 'prev') {
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const newDate = currentDate.toISOString().split('T')[0];
    setDate(newDate);

    // Auto-apply when navigating
    const params = new URLSearchParams();
    params.set('date', newDate);
    if (branch) params.set('branch', branch);
    if (status) params.set('status', status);
    router.push(`/attendance?${params.toString()}`);
  };

  // Quick date selection
  const selectQuickDate = (quickDate: string) => {
    setDate(quickDate);
    const params = new URLSearchParams();
    params.set('date', quickDate);
    if (branch) params.set('branch', branch);
    if (status) params.set('status', status);
    router.push(`/attendance?${params.toString()}`);
  };

  // Check if selected date is in the future
  const isFutureDate = new Date(date + 'T00:00:00') > new Date();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      {/* Quick Date Buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-xs font-medium text-gray-500 self-center mr-2">Quick Select:</span>
        <button
          onClick={() => selectQuickDate(quickDates.today)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            date === quickDates.today
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Today
        </button>
        <button
          onClick={() => selectQuickDate(quickDates.yesterday)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            date === quickDates.yesterday
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Yesterday
        </button>
        <button
          onClick={() => selectQuickDate(quickDates.weekAgo)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            date === quickDates.weekAgo
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last Week
        </button>
        <button
          onClick={() => selectQuickDate(quickDates.monthStart)}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            date === quickDates.monthStart
              ? 'bg-purple-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Month Start
        </button>
      </div>

      <div className="flex flex-wrap gap-4 items-end">
        {/* Date Picker with Navigation */}
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigateDay('prev')}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Previous day"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-white min-w-[200px]">
              <Calendar size={18} className="text-purple-500" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={quickDates.today}
                className="outline-none text-sm flex-1 bg-transparent"
              />
            </div>
            <button
              onClick={() => navigateDay('next')}
              disabled={date === quickDates.today}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-gray-500"
              title="Next day"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          {/* Display friendly date */}
          <p className="text-xs text-purple-600 mt-1 ml-10">{formatDateDisplay(date)}</p>
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
