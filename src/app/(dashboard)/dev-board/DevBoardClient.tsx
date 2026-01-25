'use client';

import { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Bug,
  Sparkles,
  Wrench,
  CheckSquare,
  Building2,
  MessageCircle,
  Calendar,
  Target,
  Clock,
  AlertCircle,
  ChevronDown,
  X,
  GripVertical,
  Loader2,
  Settings,
  Play,
  CheckCircle2,
  Archive,
  ArrowRight,
  Trash2,
} from 'lucide-react';

// Types
interface Project {
  id: string;
  name: string;
  color: string;
  icon: string;
}

interface Sprint {
  id: string;
  name: string;
  goal?: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed';
}

interface Task {
  id: string;
  title: string;
  description?: string;
  project_id?: string;
  sprint_id?: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'testing' | 'done';
  task_type: 'feature' | 'bug' | 'improvement' | 'task';
  priority: 'P0' | 'P1' | 'P2' | 'P3';
  category?: string;
  estimate?: string;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  project?: Project;
  sprint?: Sprint;
}

interface Stats {
  total: number;
  byStatus: Record<string, number>;
  byType: Record<string, number>;
  byPriority: Record<string, number>;
  activeSprint?: {
    id: string;
    name: string;
    progress: number;
    total: number;
    completed: number;
  };
  bugs: { open: number; total: number };
}

// Status columns configuration
const COLUMNS = [
  { id: 'backlog', label: 'Backlog', icon: '📥', color: 'bg-gray-100' },
  { id: 'todo', label: 'To Do', icon: '📋', color: 'bg-blue-100' },
  { id: 'in_progress', label: 'In Progress', icon: '🔨', color: 'bg-yellow-100' },
  { id: 'testing', label: 'Testing', icon: '🧪', color: 'bg-purple-100' },
  { id: 'done', label: 'Done', icon: '✅', color: 'bg-green-100' },
];

// Priority colors
const priorityColors: Record<string, string> = {
  P0: 'bg-red-100 text-red-700 border-red-200',
  P1: 'bg-orange-100 text-orange-700 border-orange-200',
  P2: 'bg-blue-100 text-blue-700 border-blue-200',
  P3: 'bg-gray-100 text-gray-600 border-gray-200',
};

// Task type icons
const typeIcons: Record<string, React.ReactNode> = {
  feature: <Sparkles size={14} className="text-purple-500" />,
  bug: <Bug size={14} className="text-red-500" />,
  improvement: <Wrench size={14} className="text-blue-500" />,
  task: <CheckSquare size={14} className="text-gray-500" />,
};

// Project icons
const projectIcons: Record<string, React.ReactNode> = {
  building: <Building2 size={14} />,
  'message-circle': <MessageCircle size={14} />,
};

interface DevBoardClientProps {
  userName: string;
}

export default function DevBoardClient({ userName }: DevBoardClientProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedProject, setSelectedProject] = useState<string | null>(null);
  const [selectedSprint, setSelectedSprint] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Modal
  const [showNewTask, setShowNewTask] = useState(false);
  const [newTaskStatus, setNewTaskStatus] = useState<string>('backlog');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [showSprintPanel, setShowSprintPanel] = useState(false);

  // Fetch data
  useEffect(() => {
    fetchData();
  }, [selectedProject, selectedSprint]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedProject) params.set('project', selectedProject);
      if (selectedSprint) params.set('sprint', selectedSprint);

      const [tasksRes, projectsRes, sprintsRes, statsRes] = await Promise.all([
        fetch(`/api/dev-board/tasks?${params}`),
        fetch('/api/dev-board/projects'),
        fetch('/api/dev-board/sprints'),
        fetch('/api/dev-board/stats'),
      ]);

      const [tasksData, projectsData, sprintsData, statsData] = await Promise.all([
        tasksRes.json(),
        projectsRes.json(),
        sprintsRes.json(),
        statsRes.json(),
      ]);

      setTasks(tasksData.tasks || []);
      setProjects(projectsData.projects || []);
      setSprints(sprintsData.sprints || []);
      setStats(statsData.stats || null);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update task status (drag & drop or click)
  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // Optimistic update
    setTasks(prev => prev.map(t =>
      t.id === taskId ? { ...t, status: newStatus as Task['status'] } : t
    ));

    try {
      await fetch(`/api/dev-board/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      fetchData(); // Revert on error
    }
  };

  // Drag handlers
  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (status: string) => {
    if (draggedTask && draggedTask.status !== status) {
      updateTaskStatus(draggedTask.id, status);
    }
    setDraggedTask(null);
  };

  // Get tasks for a column
  const getColumnTasks = (status: string) => {
    return tasks.filter(t => t.status === status);
  };

  // Active sprint
  const activeSprint = sprints.find(s => s.status === 'active');

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🛠️ Dev Board</h1>
            <p className="text-gray-600">Track platform development together</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSprintPanel(true)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Settings size={18} />
              Sprints
            </button>
            <button
              onClick={() => setShowNewTask(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus size={18} />
              New Task
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Total Tasks</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500">In Progress</p>
              <p className="text-xl font-bold text-yellow-600">{stats.byStatus.in_progress}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Done</p>
              <p className="text-xl font-bold text-green-600">{stats.byStatus.done}</p>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <p className="text-xs text-gray-500">Open Bugs</p>
              <p className="text-xl font-bold text-red-600">{stats.bugs.open}</p>
            </div>
            {stats.activeSprint && (
              <div className="bg-purple-50 rounded-lg border border-purple-200 p-3">
                <p className="text-xs text-purple-600">Sprint Progress</p>
                <div className="flex items-center gap-2">
                  <p className="text-xl font-bold text-purple-700">{stats.activeSprint.progress}%</p>
                  <div className="flex-1 bg-purple-200 rounded-full h-2">
                    <div
                      className="bg-purple-600 rounded-full h-2 transition-all"
                      style={{ width: `${stats.activeSprint.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-colors ${
              showFilters ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Filter size={16} />
            Filters
            <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          {/* Project Filter */}
          <select
            value={selectedProject || ''}
            onChange={(e) => setSelectedProject(e.target.value || null)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Sprint Filter */}
          <select
            value={selectedSprint || ''}
            onChange={(e) => setSelectedSprint(e.target.value || null)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white"
          >
            <option value="">All Sprints</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} {s.status === 'active' ? '(Active)' : ''}
              </option>
            ))}
          </select>

          {/* Active Sprint Info */}
          {activeSprint && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-purple-50 rounded-lg text-sm text-purple-700">
              <Target size={14} />
              <span className="font-medium">{activeSprint.name}</span>
              {activeSprint.goal && (
                <span className="text-purple-500">• {activeSprint.goal}</span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 size={32} className="animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="flex gap-4 h-full min-w-max pb-4">
            {COLUMNS.map(column => {
              const columnTasks = getColumnTasks(column.id);
              return (
                <div
                  key={column.id}
                  className="w-72 flex-shrink-0 flex flex-col"
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(column.id)}
                >
                  {/* Column Header */}
                  <div className={`${column.color} rounded-t-lg px-3 py-2`}>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">
                        {column.icon} {column.label}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500 bg-white px-2 py-0.5 rounded-full">
                          {columnTasks.length}
                        </span>
                        <button
                          onClick={() => {
                            setNewTaskStatus(column.id);
                            setShowNewTask(true);
                          }}
                          className="p-1 text-gray-400 hover:text-purple-600 hover:bg-white rounded transition-colors"
                          title="Add task"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Column Body */}
                  <div className="flex-1 bg-gray-50 rounded-b-lg p-2 space-y-2 overflow-y-auto min-h-[200px]">
                    {columnTasks.map(task => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onDragStart={() => handleDragStart(task)}
                        onClick={() => setSelectedTask(task)}
                      />
                    ))}

                    {columnTasks.length === 0 && (
                      <div className="text-center py-8 text-gray-400 text-sm">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Task Modal */}
      {showNewTask && (
        <NewTaskModal
          projects={projects}
          sprints={sprints}
          initialStatus={newTaskStatus}
          onClose={() => setShowNewTask(false)}
          onCreated={() => {
            setShowNewTask(false);
            fetchData();
          }}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          projects={projects}
          sprints={sprints}
          userName={userName}
          onClose={() => setSelectedTask(null)}
          onUpdated={() => {
            setSelectedTask(null);
            fetchData();
          }}
        />
      )}

      {/* Sprint Management Panel */}
      {showSprintPanel && (
        <SprintManagementPanel
          sprints={sprints}
          onClose={() => setShowSprintPanel(false)}
          onUpdated={() => {
            setShowSprintPanel(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

// Task Card Component
function TaskCard({
  task,
  onDragStart,
  onClick,
}: {
  task: Task;
  onDragStart: () => void;
  onClick: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md transition-shadow group"
    >
      <div className="flex items-start gap-2">
        <GripVertical size={14} className="text-gray-300 mt-1 opacity-0 group-hover:opacity-100 cursor-grab" />
        <div className="flex-1 min-w-0">
          {/* Type & Priority */}
          <div className="flex items-center gap-2 mb-1">
            {typeIcons[task.task_type]}
            <span className={`text-xs px-1.5 py-0.5 rounded border ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
            {task.project && (
              <span
                className="text-xs px-1.5 py-0.5 rounded text-white"
                style={{ backgroundColor: task.project.color }}
              >
                {task.project.name.split(' ')[0]}
              </span>
            )}
          </div>

          {/* Title */}
          <p className="font-medium text-gray-900 text-sm line-clamp-2">{task.title}</p>

          {/* Meta */}
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            {task.category && (
              <span className="bg-gray-100 px-1.5 py-0.5 rounded">{task.category}</span>
            )}
            {task.estimate && (
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {task.estimate}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// New Task Modal
function NewTaskModal({
  projects,
  sprints,
  initialStatus = 'backlog',
  onClose,
  onCreated,
}: {
  projects: Project[];
  sprints: Sprint[];
  initialStatus?: string;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    project_id: '',
    sprint_id: '',
    status: initialStatus,
    task_type: 'feature',
    priority: 'P1',
    category: '',
    estimate: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/dev-board/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_id: formData.project_id || null,
          sprint_id: formData.sprint_id || null,
        }),
      });

      if (res.ok) {
        onCreated();
      }
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">New Task</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="What needs to be done?"
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
              autoFocus
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Status & Type & Priority */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="backlog">📥 Backlog</option>
                <option value="todo">📋 To Do</option>
                <option value="in_progress">🔨 In Progress</option>
                <option value="testing">🧪 Testing</option>
                <option value="done">✅ Done</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.task_type}
                onChange={(e) => setFormData({ ...formData, task_type: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="feature">✨ Feature</option>
                <option value="bug">🐛 Bug</option>
                <option value="improvement">🔧 Improvement</option>
                <option value="task">☑️ Task</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="P0">🔴 P0</option>
                <option value="P1">🟠 P1</option>
                <option value="P2">🔵 P2</option>
                <option value="P3">⚪ P3</option>
              </select>
            </div>
          </div>

          {/* Project & Sprint */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">No project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sprint</label>
              <select
                value={formData.sprint_id}
                onChange={(e) => setFormData({ ...formData, sprint_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Backlog</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Category & Estimate */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., attendance, recruitment"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimate</label>
              <input
                type="text"
                value={formData.estimate}
                onChange={(e) => setFormData({ ...formData, estimate: e.target.value })}
                placeholder="e.g., 2h, 1d, 1w"
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !formData.title.trim()}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Task Detail Modal
function TaskDetailModal({
  task,
  projects,
  sprints,
  userName,
  onClose,
  onUpdated,
}: {
  task: Task;
  projects: Project[];
  sprints: Sprint[];
  userName: string;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: task.title,
    description: task.description || '',
    project_id: task.project_id || '',
    sprint_id: task.sprint_id || '',
    status: task.status,
    task_type: task.task_type,
    priority: task.priority,
    category: task.category || '',
    estimate: task.estimate || '',
  });
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState<Array<{ id: string; content: string; author: string; created_at: string }>>([]);

  // Load comments
  useEffect(() => {
    fetch(`/api/dev-board/tasks/${task.id}`)
      .then(res => res.json())
      .then(data => setComments(data.comments || []));
  }, [task.id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch(`/api/dev-board/tasks/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          project_id: formData.project_id || null,
          sprint_id: formData.sprint_id || null,
        }),
      });
      onUpdated();
    } catch (error) {
      console.error('Failed to update task:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    try {
      const res = await fetch(`/api/dev-board/tasks/${task.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment, author: userName }),
      });
      const data = await res.json();
      setComments([...comments, data.comment]);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this task?')) return;
    try {
      await fetch(`/api/dev-board/tasks/${task.id}`, { method: 'DELETE' });
      onUpdated();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white">
          <div className="flex items-center gap-2">
            {typeIcons[task.task_type]}
            <span className={`text-xs px-2 py-0.5 rounded border ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X size={20} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Title */}
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full text-xl font-semibold border-0 focus:ring-0 p-0"
          />

          {/* Status */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Status:</span>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
              className="px-2 py-1 border rounded-lg text-sm"
            >
              {COLUMNS.map(col => (
                <option key={col.id} value={col.id}>{col.icon} {col.label}</option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add details..."
              rows={4}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* Meta */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.task_type}
                onChange={(e) => setFormData({ ...formData, task_type: e.target.value as Task['task_type'] })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="feature">✨ Feature</option>
                <option value="bug">🐛 Bug</option>
                <option value="improvement">🔧 Improvement</option>
                <option value="task">☑️ Task</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="P0">🔴 P0 - Critical</option>
                <option value="P1">🟠 P1 - High</option>
                <option value="P2">🔵 P2 - Medium</option>
                <option value="P3">⚪ P3 - Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">No project</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sprint</label>
              <select
                value={formData.sprint_id}
                onChange={(e) => setFormData({ ...formData, sprint_id: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Backlog</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimate</label>
              <input
                type="text"
                value={formData.estimate}
                onChange={(e) => setFormData({ ...formData, estimate: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Comments */}
          <div className="border-t pt-4">
            <h3 className="font-medium text-gray-900 mb-3">Comments</h3>
            <div className="space-y-3 mb-3">
              {comments.map(comment => {
                const isJarvis = comment.author === 'Jarvis' || comment.author === 'Claude (AI)' || comment.author === 'claude';
                return (
                <div key={comment.id} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    isJarvis ? 'bg-purple-500 text-white' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isJarvis ? '🤖' : comment.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-medium ${isJarvis ? 'text-purple-700' : ''}`}>
                        {isJarvis ? 'Jarvis' : comment.author}
                      </span>
                      {isJarvis && <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded">AI</span>}
                      <span className="text-xs text-gray-400">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{comment.content}</p>
                  </div>
                </div>
              );})}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border rounded-lg text-sm"
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                className="px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
              >
                Send
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              Delete
            </button>
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sprint Management Panel
function SprintManagementPanel({
  sprints,
  onClose,
  onUpdated,
}: {
  sprints: Sprint[];
  onClose: () => void;
  onUpdated: () => void;
}) {
  const [view, setView] = useState<'list' | 'new' | 'complete'>('list');
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sprintStats, setSprintStats] = useState<Record<string, { total: number; completed: number }>>({});

  // New sprint form
  const [newSprint, setNewSprint] = useState({
    name: '',
    goal: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

  // Complete sprint options
  const [completeOptions, setCompleteOptions] = useState({
    incompleteTaskAction: 'backlog' as 'backlog' | 'next_sprint' | 'keep',
    nextSprintId: '',
  });

  // Fetch stats for each sprint
  useEffect(() => {
    sprints.forEach(async (sprint) => {
      try {
        const res = await fetch(`/api/dev-board/sprints/${sprint.id}`);
        const data = await res.json();
        if (data.taskStats) {
          setSprintStats(prev => ({
            ...prev,
            [sprint.id]: {
              total: data.taskStats.total,
              completed: data.taskStats.completed,
            }
          }));
        }
      } catch (e) {
        console.error('Failed to fetch sprint stats:', e);
      }
    });
  }, [sprints]);

  const handleCreateSprint = async () => {
    if (!newSprint.name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch('/api/dev-board/sprints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSprint),
      });
      if (res.ok) {
        onUpdated();
      }
    } catch (error) {
      console.error('Failed to create sprint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSprint = async (sprintId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dev-board/sprints/${sprintId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'active' }),
      });
      if (res.ok) {
        onUpdated();
      }
    } catch (error) {
      console.error('Failed to start sprint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteSprint = async () => {
    if (!selectedSprintId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dev-board/sprints/${selectedSprintId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(completeOptions),
      });
      if (res.ok) {
        onUpdated();
      }
    } catch (error) {
      console.error('Failed to complete sprint:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSprint = async (sprintId: string) => {
    if (!confirm('Delete this sprint? Tasks will be moved to backlog.')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dev-board/sprints/${sprintId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        onUpdated();
      }
    } catch (error) {
      console.error('Failed to delete sprint:', error);
    } finally {
      setLoading(false);
    }
  };

  const activeSprint = sprints.find(s => s.status === 'active');
  const planningSprints = sprints.filter(s => s.status === 'planning');
  const completedSprints = sprints.filter(s => s.status === 'completed');

  const getNextSprintNumber = () => {
    const numbers = sprints.map(s => {
      const match = s.name.match(/Sprint (\d+)/);
      return match ? parseInt(match[1]) : 0;
    });
    return Math.max(0, ...numbers) + 1;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-purple-600 to-purple-700">
          <div className="flex items-center gap-3">
            <Settings className="text-white" size={24} />
            <div>
              <h2 className="text-lg font-semibold text-white">Sprint Management</h2>
              <p className="text-purple-200 text-sm">Manage your development sprints</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded text-white">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {view === 'list' && (
            <div className="space-y-6">
              {/* Active Sprint */}
              {activeSprint && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Play size={18} className="text-green-600" />
                      <h3 className="font-semibold text-green-800">Active Sprint</h3>
                    </div>
                    <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{activeSprint.name}</p>
                      {activeSprint.goal && <p className="text-sm text-gray-600 mt-1">{activeSprint.goal}</p>}
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(activeSprint.start_date).toLocaleDateString()} - {new Date(activeSprint.end_date).toLocaleDateString()}
                      </p>
                      {sprintStats[activeSprint.id] && (
                        <div className="mt-2">
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">
                              {sprintStats[activeSprint.id].completed}/{sprintStats[activeSprint.id].total} tasks
                            </span>
                            <div className="flex-1 max-w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 rounded-full h-2 transition-all"
                                style={{ width: `${sprintStats[activeSprint.id].total > 0 ? (sprintStats[activeSprint.id].completed / sprintStats[activeSprint.id].total * 100) : 0}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedSprintId(activeSprint.id);
                        setView('complete');
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                    >
                      <CheckCircle2 size={16} />
                      Complete Sprint
                    </button>
                  </div>
                </div>
              )}

              {/* Create New Sprint */}
              <button
                onClick={() => {
                  setNewSprint(prev => ({
                    ...prev,
                    name: `Sprint ${getNextSprintNumber()}`,
                  }));
                  setView('new');
                }}
                className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-purple-300 rounded-lg text-purple-600 hover:bg-purple-50 hover:border-purple-400 transition-colors"
              >
                <Plus size={20} />
                <span className="font-medium">Create New Sprint</span>
              </button>

              {/* Planning Sprints */}
              {planningSprints.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Calendar size={16} />
                    Upcoming Sprints ({planningSprints.length})
                  </h3>
                  <div className="space-y-2">
                    {planningSprints.map(sprint => (
                      <div key={sprint.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{sprint.name}</p>
                          {sprint.goal && <p className="text-sm text-gray-500">{sprint.goal}</p>}
                          <p className="text-xs text-gray-400">
                            {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {!activeSprint && (
                            <button
                              onClick={() => handleStartSprint(sprint.id)}
                              disabled={loading}
                              className="flex items-center gap-1 px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm disabled:opacity-50"
                            >
                              <Play size={14} />
                              Start
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteSprint(sprint.id)}
                            disabled={loading}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Completed Sprints */}
              {completedSprints.length > 0 && (
                <div>
                  <h3 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Archive size={16} />
                    Completed Sprints ({completedSprints.length})
                  </h3>
                  <div className="space-y-2">
                    {completedSprints.slice(0, 5).map(sprint => (
                      <div key={sprint.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center justify-between opacity-75">
                        <div>
                          <p className="font-medium text-gray-700">{sprint.name}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">COMPLETED</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {view === 'new' && (
            <div className="space-y-4">
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to sprints
              </button>

              <h3 className="text-lg font-semibold">Create New Sprint</h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Name *</label>
                <input
                  type="text"
                  value={newSprint.name}
                  onChange={(e) => setNewSprint({ ...newSprint, name: e.target.value })}
                  placeholder="e.g., Sprint 2"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sprint Goal</label>
                <input
                  type="text"
                  value={newSprint.goal}
                  onChange={(e) => setNewSprint({ ...newSprint, goal: e.target.value })}
                  placeholder="e.g., Complete recruitment module"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newSprint.start_date}
                    onChange={(e) => setNewSprint({ ...newSprint, start_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newSprint.end_date}
                    onChange={(e) => setNewSprint({ ...newSprint, end_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setView('list')}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSprint}
                  disabled={loading || !newSprint.name.trim()}
                  className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Sprint'}
                </button>
              </div>
            </div>
          )}

          {view === 'complete' && selectedSprintId && (
            <div className="space-y-4">
              <button
                onClick={() => setView('list')}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
              >
                ← Back to sprints
              </button>

              <h3 className="text-lg font-semibold">Complete Sprint</h3>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                  <strong>What happens to incomplete tasks?</strong>
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Choose what to do with tasks that aren&apos;t marked as Done.
                </p>
              </div>

              <div className="space-y-3">
                <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="taskAction"
                    checked={completeOptions.incompleteTaskAction === 'backlog'}
                    onChange={() => setCompleteOptions({ ...completeOptions, incompleteTaskAction: 'backlog', nextSprintId: '' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Move to Backlog</p>
                    <p className="text-sm text-gray-500">Incomplete tasks go back to the backlog for future planning</p>
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="taskAction"
                    checked={completeOptions.incompleteTaskAction === 'next_sprint'}
                    onChange={() => setCompleteOptions({ ...completeOptions, incompleteTaskAction: 'next_sprint' })}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Move to Next Sprint</p>
                    <p className="text-sm text-gray-500">Roll over to an upcoming sprint</p>
                    {completeOptions.incompleteTaskAction === 'next_sprint' && (
                      <select
                        value={completeOptions.nextSprintId}
                        onChange={(e) => setCompleteOptions({ ...completeOptions, nextSprintId: e.target.value })}
                        className="mt-2 w-full px-3 py-2 border rounded-lg text-sm"
                      >
                        <option value="">Select sprint...</option>
                        {planningSprints.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </label>

                <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="taskAction"
                    checked={completeOptions.incompleteTaskAction === 'keep'}
                    onChange={() => setCompleteOptions({ ...completeOptions, incompleteTaskAction: 'keep', nextSprintId: '' })}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Keep in Completed Sprint</p>
                    <p className="text-sm text-gray-500">Leave tasks as-is for historical record</p>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setView('list')}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCompleteSprint}
                  disabled={loading || (completeOptions.incompleteTaskAction === 'next_sprint' && !completeOptions.nextSprintId)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={18} />
                  {loading ? 'Completing...' : 'Complete Sprint'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
