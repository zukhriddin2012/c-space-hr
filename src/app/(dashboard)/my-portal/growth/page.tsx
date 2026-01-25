'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Rocket,
  AlertTriangle,
  ArrowUp,
  Target,
  Calendar,
  Users,
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Upload,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Loader2,
  User,
  FileText,
} from 'lucide-react';

interface GrowthProject {
  id: string;
  title: string;
  tag: string | null;
  priority: 'critical' | 'high' | 'strategic' | 'normal' | null;
  status: 'pending' | 'in_progress' | 'blocked' | 'completed' | 'cancelled';
  deadline: string | null;
  owner: string | null;
  accountable: string[] | null;
  description: string | null;
  details: Record<string, unknown> | null;
  actions: { text: string; completed?: boolean }[] | null;
  alert: string | null;
  created_at: string;
  updated_at: string;
}

interface GrowthKeyDate {
  id: string;
  date: string;
  label: string;
  events: string;
  highlight: boolean;
  critical: boolean;
}

interface GrowthPersonalFocus {
  id: string;
  person: string;
  role: string | null;
  emoji: string | null;
  items: string[] | null;
}

interface GrowthSync {
  id: string;
  title: string;
  sync_date: string;
  next_sync_date: string | null;
  next_sync_time: string | null;
  next_sync_focus: string[] | null;
  resolved: string[] | null;
}

interface TeamMember {
  id: string;
  employee_id: string;
  full_name: string;
  position: string;
}

interface GrowthData {
  projects: {
    all: GrowthProject[];
    critical: GrowthProject[];
    highPriority: GrowthProject[];
    strategic: GrowthProject[];
    other: GrowthProject[];
  };
  keyDates: GrowthKeyDate[];
  personalFocus: GrowthPersonalFocus[];
  latestSync: GrowthSync | null;
  teamMembers: TeamMember[];
  stats: {
    totalProjects: number;
    criticalCount: number;
    highPriorityCount: number;
    inProgressCount: number;
    blockedCount: number;
    teamMemberCount: number;
  };
}

const priorityColors = {
  critical: 'bg-red-100 text-red-800 border-red-200',
  high: 'bg-orange-100 text-orange-800 border-orange-200',
  strategic: 'bg-blue-100 text-blue-800 border-blue-200',
  normal: 'bg-gray-100 text-gray-800 border-gray-200',
};

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  in_progress: 'bg-blue-100 text-blue-800',
  blocked: 'bg-red-100 text-red-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-gray-100 text-gray-600',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ProjectCard({ project, expanded, onToggle }: { project: GrowthProject; expanded: boolean; onToggle: () => void }) {
  return (
    <div className={`bg-white rounded-lg border ${project.priority === 'critical' ? 'border-red-200' : project.priority === 'high' ? 'border-orange-200' : 'border-gray-200'} overflow-hidden`}>
      <div
        className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {project.tag && (
                <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                  {project.tag}
                </span>
              )}
              <span className={`px-2 py-0.5 text-xs font-medium rounded ${statusColors[project.status]}`}>
                {project.status.replace('_', ' ')}
              </span>
            </div>
            <h4 className="font-medium text-gray-900">{project.title}</h4>
            {project.owner && (
              <p className="text-sm text-gray-500 mt-1">
                Owner: {project.owner}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {project.deadline && (
              <span className="text-xs text-gray-500 whitespace-nowrap">
                {project.deadline}
              </span>
            )}
            {expanded ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
          </div>
        </div>

        {project.alert && (
          <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
            ⚠️ {project.alert}
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-4 pb-4 pt-2 border-t border-gray-100 bg-gray-50">
          {project.description && (
            <div className="mb-3">
              <p className="text-sm text-gray-600">{project.description}</p>
            </div>
          )}

          {project.accountable && project.accountable.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Accountable</p>
              <div className="flex flex-wrap gap-1">
                {project.accountable.map((person, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded">
                    {person}
                  </span>
                ))}
              </div>
            </div>
          )}

          {project.actions && project.actions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase mb-1">Actions</p>
              <ul className="space-y-1">
                {project.actions.map((action, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className={action.completed ? 'text-green-500' : 'text-gray-400'}>
                      {action.completed ? '✓' : '○'}
                    </span>
                    <span className={action.completed ? 'text-gray-500 line-through' : 'text-gray-700'}>
                      {typeof action === 'string' ? action : action.text}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function GrowthPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<GrowthData | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [showTeam, setShowTeam] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importMessage, setImportMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchGrowthData();
  }, []);

  async function fetchGrowthData() {
    try {
      setLoading(true);
      const response = await fetch('/api/growth');

      if (!response.ok) {
        if (response.status === 403) {
          setError('Access denied. You are not part of the Growth Team.');
          return;
        }
        throw new Error('Failed to fetch Growth data');
      }

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Growth data');
    } finally {
      setLoading(false);
    }
  }

  function toggleProject(id: string) {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  async function handleExport() {
    try {
      const response = await fetch('/api/growth/export');
      if (!response.ok) {
        throw new Error('Failed to export');
      }
      const data = await response.json();

      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `metronome-sync-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('Failed to export data');
    }
  }

  async function handleImport(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportMessage(null);

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      const response = await fetch('/api/growth/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to import');
      }

      setImportMessage(result.message);
      // Refresh data
      await fetchGrowthData();
    } catch (err) {
      console.error('Import error:', err);
      setImportMessage(`Error: ${err instanceof Error ? err.message : 'Failed to import data'}`);
    } finally {
      setImporting(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading Growth Dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/my-portal"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            <ArrowLeft size={16} />
            Back to My Portal
          </Link>
        </div>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/my-portal"
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </Link>
              <div>
                <div className="flex items-center gap-2">
                  <Rocket size={24} />
                  <h1 className="text-2xl font-bold">Growth Dashboard</h1>
                </div>
                <p className="text-orange-100 text-sm mt-1">
                  Strategic projects & leadership alignment
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                className="hidden"
                onChange={handleImport}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={importing}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {importing ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                Import Sync
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
              >
                <Download size={16} />
                Export
              </button>
              <button
                onClick={fetchGrowthData}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Import message */}
      {importMessage && (
        <div className={`mx-auto max-w-7xl px-4 mt-4`}>
          <div className={`p-3 rounded-lg ${importMessage.startsWith('Error') ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
            {importMessage}
            <button onClick={() => setImportMessage(null)} className="ml-2 font-bold">×</button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex items-center gap-2 text-gray-500 mb-1">
              <FileText size={16} />
              <span className="text-xs uppercase font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{data.stats.totalProjects}</p>
          </div>
          <div className="bg-white rounded-xl border border-red-200 p-4">
            <div className="flex items-center gap-2 text-red-500 mb-1">
              <AlertTriangle size={16} />
              <span className="text-xs uppercase font-medium">Critical</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{data.stats.criticalCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-orange-200 p-4">
            <div className="flex items-center gap-2 text-orange-500 mb-1">
              <ArrowUp size={16} />
              <span className="text-xs uppercase font-medium">High</span>
            </div>
            <p className="text-2xl font-bold text-orange-600">{data.stats.highPriorityCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-blue-200 p-4">
            <div className="flex items-center gap-2 text-blue-500 mb-1">
              <Clock size={16} />
              <span className="text-xs uppercase font-medium">In Progress</span>
            </div>
            <p className="text-2xl font-bold text-blue-600">{data.stats.inProgressCount}</p>
          </div>
          <div className="bg-white rounded-xl border border-yellow-200 p-4">
            <div className="flex items-center gap-2 text-yellow-600 mb-1">
              <AlertCircle size={16} />
              <span className="text-xs uppercase font-medium">Blocked</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{data.stats.blockedCount}</p>
          </div>
          <button
            onClick={() => setShowTeam(!showTeam)}
            className="bg-white rounded-xl border border-purple-200 p-4 text-left hover:bg-purple-50 transition-colors"
          >
            <div className="flex items-center gap-2 text-purple-500 mb-1">
              <Users size={16} />
              <span className="text-xs uppercase font-medium">Team</span>
            </div>
            <p className="text-2xl font-bold text-purple-600">{data.stats.teamMemberCount}</p>
          </button>
        </div>

        {/* Team Members (collapsible) */}
        {showTeam && (
          <div className="bg-white rounded-xl border border-purple-200 p-4 mb-6">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Users size={18} className="text-purple-500" />
              Growth Team Members
            </h3>
            <div className="flex flex-wrap gap-2">
              {data.teamMembers.map(member => (
                <div key={member.id} className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg">
                  <User size={14} className="text-purple-500" />
                  <span className="text-sm font-medium text-gray-900">{member.full_name}</span>
                  <span className="text-xs text-gray-500">({member.position})</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Sync Info */}
        {data.latestSync && data.latestSync.next_sync_date && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-blue-500" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Next Sync</p>
                  <p className="text-lg font-bold text-blue-700">
                    {formatDate(data.latestSync.next_sync_date)}
                    {data.latestSync.next_sync_time && ` at ${data.latestSync.next_sync_time}`}
                  </p>
                </div>
              </div>
              {data.latestSync.next_sync_focus && data.latestSync.next_sync_focus.length > 0 && (
                <div className="text-right">
                  <p className="text-xs text-gray-500 uppercase font-medium mb-1">Focus Areas</p>
                  <div className="flex flex-wrap gap-1 justify-end">
                    {data.latestSync.next_sync_focus.map((focus, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                        {focus}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Projects Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Critical Projects */}
            {data.projects.critical.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="text-red-500" size={18} />
                  <h2 className="text-lg font-semibold text-gray-900">Critical</h2>
                  <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">
                    {data.projects.critical.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {data.projects.critical.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      expanded={expandedProjects.has(project.id)}
                      onToggle={() => toggleProject(project.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* High Priority Projects */}
            {data.projects.highPriority.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowUp className="text-orange-500" size={18} />
                  <h2 className="text-lg font-semibold text-gray-900">High Priority</h2>
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                    {data.projects.highPriority.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {data.projects.highPriority.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      expanded={expandedProjects.has(project.id)}
                      onToggle={() => toggleProject(project.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Strategic Projects */}
            {data.projects.strategic.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Target className="text-blue-500" size={18} />
                  <h2 className="text-lg font-semibold text-gray-900">Strategic</h2>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                    {data.projects.strategic.length}
                  </span>
                </div>
                <div className="space-y-3">
                  {data.projects.strategic.map(project => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      expanded={expandedProjects.has(project.id)}
                      onToggle={() => toggleProject(project.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {data.projects.all.length === 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
                <Rocket size={48} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
                <p className="text-gray-500 mb-4">Import a Metronome Sync to get started with strategic projects.</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  <Upload size={16} />
                  Import Metronome Sync
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Key Dates */}
            {data.keyDates.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Calendar size={18} className="text-gray-500" />
                  Key Dates
                </h3>
                <div className="space-y-2">
                  {data.keyDates.slice(0, 10).map(date => (
                    <div
                      key={date.id}
                      className={`p-2 rounded-lg ${
                        date.critical
                          ? 'bg-red-50 border border-red-100'
                          : date.highlight
                          ? 'bg-yellow-50 border border-yellow-100'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-gray-500">{date.label}</span>
                        <span className={`text-xs font-medium ${date.critical ? 'text-red-600' : 'text-gray-600'}`}>
                          {formatDate(date.date)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{date.events}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Personal Focus */}
            {data.personalFocus.length > 0 && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target size={18} className="text-gray-500" />
                  Personal Focus
                </h3>
                <div className="space-y-3">
                  {data.personalFocus.map(focus => (
                    <div key={focus.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        {focus.emoji && <span>{focus.emoji}</span>}
                        <span className="font-medium text-gray-900">{focus.person}</span>
                        {focus.role && (
                          <span className="text-xs text-gray-500">({focus.role})</span>
                        )}
                      </div>
                      {focus.items && focus.items.length > 0 && (
                        <ul className="space-y-1">
                          {focus.items.map((item, idx) => (
                            <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                              <span className="text-gray-400">•</span>
                              {item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resolved Items */}
            {data.latestSync?.resolved && data.latestSync.resolved.length > 0 && (
              <div className="bg-white rounded-xl border border-green-200 p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-500" />
                  Recently Resolved
                </h3>
                <ul className="space-y-2">
                  {data.latestSync.resolved.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
