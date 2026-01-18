'use client';

import { useState } from 'react';
import {
  BarChart3,
  Download,
  Calendar,
  Users,
  DollarSign,
  Clock,
  TrendingUp,
  FileSpreadsheet,
  PieChart,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

type ReportType = 'attendance' | 'payroll' | 'headcount' | 'turnover';

interface ReportCard {
  id: ReportType;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
  stats: {
    label: string;
    value: string;
    change?: number;
  };
}

const reportCards: ReportCard[] = [
  {
    id: 'attendance',
    title: 'Attendance Report',
    description: 'Daily, weekly, and monthly attendance statistics',
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    stats: {
      label: 'Avg. Attendance Rate',
      value: '94.2%',
      change: 2.1
    }
  },
  {
    id: 'payroll',
    title: 'Payroll Report',
    description: 'Salary disbursements and payment history',
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    stats: {
      label: 'Total Disbursed (YTD)',
      value: '2.1B UZS',
      change: 5.3
    }
  },
  {
    id: 'headcount',
    title: 'Headcount Report',
    description: 'Employee distribution by branch and department',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    stats: {
      label: 'Total Employees',
      value: '56',
      change: 8.5
    }
  },
  {
    id: 'turnover',
    title: 'Turnover Report',
    description: 'Employee retention and turnover analysis',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    stats: {
      label: 'Turnover Rate',
      value: '3.2%',
      change: -1.5
    }
  }
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [dateRange, setDateRange] = useState('this_month');

  const handleExport = (reportId: ReportType) => {
    // TODO: Implement export functionality
    alert(`Exporting ${reportId} report...`);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 lg:mb-6">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-sm lg:text-base text-gray-600 mt-1">
            <span className="hidden sm:inline">Generate and export HR analytics reports</span>
            <span className="sm:hidden">HR analytics reports</span>
          </p>
        </div>
        <div className="flex items-center">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="w-full sm:w-auto px-3 lg:px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            <option value="this_week">This Week</option>
            <option value="this_month">This Month</option>
            <option value="this_quarter">This Quarter</option>
            <option value="this_year">This Year</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
      </div>

      {/* Report Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
        {reportCards.map((report) => {
          const Icon = report.icon;
          const isPositive = (report.stats.change ?? 0) >= 0;

          return (
            <div
              key={report.id}
              className={`bg-white rounded-xl border border-gray-200 p-4 lg:p-6 hover:shadow-lg transition-all cursor-pointer ${
                selectedReport === report.id ? 'ring-2 ring-purple-500' : ''
              }`}
              onClick={() => setSelectedReport(report.id)}
            >
              <div className="flex items-start justify-between mb-3 lg:mb-4">
                <div className={`p-2 lg:p-3 rounded-lg ${report.bgColor}`}>
                  <Icon size={20} className={`lg:hidden ${report.color}`} />
                  <Icon size={24} className={`hidden lg:block ${report.color}`} />
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExport(report.id);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Export Report"
                >
                  <Download size={16} className="lg:hidden" />
                  <Download size={18} className="hidden lg:block" />
                </button>
              </div>

              <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-1">{report.title}</h3>
              <p className="text-xs lg:text-sm text-gray-500 mb-3 lg:mb-4 line-clamp-2">{report.description}</p>

              <div className="pt-3 lg:pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-500 uppercase tracking-wide truncate">{report.stats.label}</p>
                    <p className="text-xl lg:text-2xl font-bold text-gray-900 mt-1">{report.stats.value}</p>
                  </div>
                  {report.stats.change !== undefined && (
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs lg:text-sm font-medium flex-shrink-0 ${
                      isPositive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {isPositive ? <ArrowUpRight size={12} className="lg:hidden" /> : <ArrowDownRight size={12} className="lg:hidden" />}
                      {isPositive ? <ArrowUpRight size={14} className="hidden lg:block" /> : <ArrowDownRight size={14} className="hidden lg:block" />}
                      {Math.abs(report.stats.change)}%
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Export Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 lg:p-6">
        <div className="flex items-center gap-3 mb-4 lg:mb-6">
          <div className="p-2 bg-purple-50 rounded-lg">
            <FileSpreadsheet size={18} className="lg:hidden text-purple-600" />
            <FileSpreadsheet size={20} className="hidden lg:block text-purple-600" />
          </div>
          <div>
            <h2 className="text-base lg:text-lg font-semibold text-gray-900">Quick Export</h2>
            <p className="text-xs lg:text-sm text-gray-500">Download pre-configured reports</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[
            { name: 'Employee Directory', icon: Users, description: 'All employees with contact info' },
            { name: 'Monthly Payroll', icon: DollarSign, description: 'Current month salary data' },
            { name: 'Attendance Summary', icon: Clock, description: 'This month attendance' },
            { name: 'Branch Overview', icon: PieChart, description: 'Staff distribution by branch' },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.name}
                className="flex items-start gap-2 lg:gap-3 p-3 lg:p-4 border border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all text-left group"
                onClick={() => alert(`Exporting ${item.name}...`)}
              >
                <Icon size={16} className="text-gray-400 group-hover:text-purple-600 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-xs lg:text-sm truncate">{item.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 hidden sm:block">{item.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="mt-4 lg:mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4 lg:p-6 border border-purple-100">
        <div className="flex items-start lg:items-center gap-3 lg:gap-4">
          <div className="p-2 lg:p-3 bg-white rounded-lg shadow-sm flex-shrink-0">
            <BarChart3 size={20} className="lg:hidden text-purple-600" />
            <BarChart3 size={24} className="hidden lg:block text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm lg:text-base">Advanced Analytics Coming Soon</h3>
            <p className="text-xs lg:text-sm text-gray-600 mt-1">
              <span className="hidden sm:inline">Interactive charts, custom date ranges, and scheduled report delivery are being developed.</span>
              <span className="sm:hidden">Interactive charts and scheduled reports coming soon.</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
