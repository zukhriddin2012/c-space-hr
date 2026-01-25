'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Bell,
  CheckCircle,
  Calendar,
  Target,
  Loader2,
  Info,
} from 'lucide-react';

interface CompanyUpdate {
  id: string;
  title: string;
  date: string;
  type: 'announcement' | 'milestone' | 'reminder';
  content: string;
}

interface GrowthKeyDate {
  id: string;
  date: string;
  label: string;
  events: string;
  highlight: boolean;
  critical: boolean;
}

interface SyncInfo {
  last_sync_date: string | null;
  next_sync_date: string | null;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CompanyUpdatesPage() {
  const [loading, setLoading] = useState(true);
  const [keyDates, setKeyDates] = useState<GrowthKeyDate[]>([]);
  const [syncInfo, setSyncInfo] = useState<SyncInfo | null>(null);

  useEffect(() => {
    fetchCompanyUpdates();
  }, []);

  async function fetchCompanyUpdates() {
    try {
      setLoading(true);
      // Try to fetch basic company info (key dates are public for all employees)
      const response = await fetch('/api/growth/public');

      if (response.ok) {
        const data = await response.json();
        setKeyDates(data.keyDates || []);
        setSyncInfo(data.syncInfo || null);
      }
    } catch (err) {
      console.error('Error fetching company updates:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading company updates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Link
              href="/my-portal"
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} className="text-gray-600" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <Bell size={24} className="text-purple-600" />
                <h1 className="text-2xl font-bold text-gray-900">Company Updates</h1>
              </div>
              <p className="text-gray-500 text-sm mt-1">
                Stay informed about important company events
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Sync Info */}
        {syncInfo && syncInfo.last_sync_date && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Info size={20} className="text-purple-600" />
              <div>
                <p className="text-sm text-purple-800">
                  Last company sync: <span className="font-medium">{formatDate(syncInfo.last_sync_date)}</span>
                </p>
                {syncInfo.next_sync_date && (
                  <p className="text-sm text-purple-600">
                    Next sync scheduled: {formatDate(syncInfo.next_sync_date)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Key Dates */}
        {keyDates.length > 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar size={18} className="text-gray-500" />
                Upcoming Key Dates
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {keyDates.map(date => (
                <div
                  key={date.id}
                  className={`p-4 ${
                    date.critical
                      ? 'bg-red-50'
                      : date.highlight
                      ? 'bg-yellow-50'
                      : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${date.critical ? 'text-red-800' : 'text-gray-900'}`}>
                          {date.label}
                        </span>
                        {date.critical && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                            Important
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{date.events}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-medium ${date.critical ? 'text-red-600' : 'text-gray-600'}`}>
                        {formatDate(date.date)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <Calendar size={48} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Updates Yet</h3>
            <p className="text-gray-500">
              Check back later for company announcements and key dates.
            </p>
          </div>
        )}

        {/* General Company Info */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target size={18} className="text-gray-500" />
            Company Focus
          </h2>
          <div className="prose prose-sm text-gray-600">
            <p>
              C-Space is focused on building great products and services for our community.
              Stay tuned for updates on our strategic initiatives and company milestones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
