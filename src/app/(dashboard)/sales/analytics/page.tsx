'use client';

import { BarChart3 } from 'lucide-react';

export default function SalesAnalyticsPage() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-gray-400">
      <BarChart3 size={48} className="mb-4" />
      <h2 className="text-lg font-medium text-gray-600">Sales Analytics</h2>
      <p className="text-sm mt-1">Analytics dashboard coming in CSC-010</p>
    </div>
  );
}
