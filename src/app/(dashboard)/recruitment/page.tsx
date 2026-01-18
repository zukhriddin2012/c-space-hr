'use client';

import { useState } from 'react';
import {
  UserPlus,
  Briefcase,
  MapPin,
  Clock,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Users,
  CheckCircle,
  XCircle,
  Calendar
} from 'lucide-react';

type JobStatus = 'open' | 'paused' | 'closed';
type ApplicationStatus = 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';

interface Job {
  id: string;
  title: string;
  department: string;
  branch: string;
  type: string;
  salary: string;
  status: JobStatus;
  applicants: number;
  postedDate: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  position: string;
  status: ApplicationStatus;
  appliedDate: string;
  avatar?: string;
}

const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Senior Software Developer',
    department: 'IT',
    branch: 'C-Space Headquarters',
    type: 'Full-time',
    salary: '15,000,000 - 20,000,000 UZS',
    status: 'open',
    applicants: 12,
    postedDate: '2026-01-10'
  },
  {
    id: '2',
    title: 'Marketing Manager',
    department: 'Marketing',
    branch: 'C-Space Headquarters',
    type: 'Full-time',
    salary: '12,000,000 - 15,000,000 UZS',
    status: 'open',
    applicants: 8,
    postedDate: '2026-01-12'
  },
  {
    id: '3',
    title: 'Customer Service Representative',
    department: 'Operations',
    branch: 'C-Space Labzak',
    type: 'Full-time',
    salary: '5,000,000 - 7,000,000 UZS',
    status: 'paused',
    applicants: 23,
    postedDate: '2026-01-05'
  },
];

const mockApplicants: Applicant[] = [
  { id: '1', name: 'Aziz Karimov', email: 'aziz@example.com', position: 'Senior Software Developer', status: 'interview', appliedDate: '2026-01-15' },
  { id: '2', name: 'Dilnoza Rahimova', email: 'dilnoza@example.com', position: 'Marketing Manager', status: 'screening', appliedDate: '2026-01-16' },
  { id: '3', name: 'Bobur Saidov', email: 'bobur@example.com', position: 'Senior Software Developer', status: 'new', appliedDate: '2026-01-17' },
  { id: '4', name: 'Nodira Yusupova', email: 'nodira@example.com', position: 'Customer Service Representative', status: 'offer', appliedDate: '2026-01-14' },
];

const statusColors: Record<JobStatus, { bg: string; text: string }> = {
  open: { bg: 'bg-green-50', text: 'text-green-700' },
  paused: { bg: 'bg-yellow-50', text: 'text-yellow-700' },
  closed: { bg: 'bg-gray-50', text: 'text-gray-700' },
};

const applicationStatusColors: Record<ApplicationStatus, { bg: string; text: string; icon: typeof CheckCircle }> = {
  new: { bg: 'bg-blue-50', text: 'text-blue-700', icon: Clock },
  screening: { bg: 'bg-purple-50', text: 'text-purple-700', icon: Eye },
  interview: { bg: 'bg-orange-50', text: 'text-orange-700', icon: Users },
  offer: { bg: 'bg-green-50', text: 'text-green-700', icon: CheckCircle },
  hired: { bg: 'bg-emerald-50', text: 'text-emerald-700', icon: CheckCircle },
  rejected: { bg: 'bg-red-50', text: 'text-red-700', icon: XCircle },
};

export default function RecruitmentPage() {
  const [activeTab, setActiveTab] = useState<'jobs' | 'applicants'>('jobs');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-gray-600 mt-1">Manage job postings and track applicants</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus size={18} />
          Post New Job
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Open Positions', value: '2', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Applicants', value: '43', icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Interviews Scheduled', value: '5', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Hired This Month', value: '3', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <Icon size={20} className={stat.color} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="border-b border-gray-200">
          <div className="flex gap-1 p-1">
            {[
              { id: 'jobs', label: 'Job Postings', count: mockJobs.length },
              { id: 'applicants', label: 'Applicants', count: mockApplicants.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as 'jobs' | 'applicants')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {tab.label}
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={activeTab === 'jobs' ? 'Search jobs...' : 'Search applicants...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'jobs' ? (
            <div className="space-y-4">
              {mockJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-200 hover:bg-purple-50/30 transition-all"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{job.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[job.status].bg} ${statusColors[job.status].text}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Briefcase size={14} />
                        {job.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin size={14} />
                        {job.branch}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {job.type}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {job.applicants} applicants
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Eye size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                      <Edit size={18} />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {mockApplicants.map((applicant) => {
                const statusConfig = applicationStatusColors[applicant.status];
                const StatusIcon = statusConfig.icon;
                return (
                  <div
                    key={applicant.id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-purple-200 hover:bg-purple-50/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-purple-700 font-medium">
                          {applicant.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{applicant.name}</h3>
                        <p className="text-sm text-gray-500">{applicant.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                        <StatusIcon size={12} />
                        {applicant.status.charAt(0).toUpperCase() + applicant.status.slice(1)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Applied {new Date(applicant.appliedDate).toLocaleDateString()}
                      </span>
                      <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
