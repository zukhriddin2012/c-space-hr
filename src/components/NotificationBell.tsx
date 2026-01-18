'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Wallet, Calendar, X } from 'lucide-react';
import Link from 'next/link';

interface PendingCounts {
  pendingPayments: number;
  pendingLeaves: number;
  total: number;
}

export default function NotificationBell() {
  const [counts, setCounts] = useState<PendingCounts>({ pendingPayments: 0, pendingLeaves: 0, total: 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCounts();
    // Refresh every 30 seconds
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCounts = async () => {
    try {
      const res = await fetch('/api/notifications/pending');
      if (res.ok) {
        const data = await res.json();
        setCounts(data);
      }
    } catch (error) {
      console.error('Error fetching notification counts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative p-2">
        <Bell size={22} className="text-gray-400" />
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell size={22} />
        {counts.total > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
            {counts.total > 9 ? '9+' : counts.total}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-200 z-50 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Pending Approvals</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {counts.total === 0 ? (
            <div className="p-6 text-center">
              <Bell size={32} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No pending approvals</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {counts.pendingPayments > 0 && (
                <Link
                  href="/payroll?status=pending_approval"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Wallet size={20} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Payment Requests</p>
                    <p className="text-sm text-gray-500">
                      {counts.pendingPayments} request{counts.pendingPayments > 1 ? 's' : ''} awaiting approval
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-orange-100 text-orange-700 text-sm font-semibold rounded-full">
                    {counts.pendingPayments}
                  </span>
                </Link>
              )}

              {counts.pendingLeaves > 0 && (
                <Link
                  href="/attendance?tab=leaves&status=pending"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Calendar size={20} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Leave Requests</p>
                    <p className="text-sm text-gray-500">
                      {counts.pendingLeaves} request{counts.pendingLeaves > 1 ? 's' : ''} awaiting review
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                    {counts.pendingLeaves}
                  </span>
                </Link>
              )}
            </div>
          )}

          <div className="p-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              Auto-refreshes every 30 seconds
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
