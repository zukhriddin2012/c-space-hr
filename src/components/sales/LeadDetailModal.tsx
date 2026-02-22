'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Phone,
  Mail,
  Users,
  FileText,
  ArrowRight,
  UserPlus,
  MapPin,
  Send,
  Calendar,
  MessageCircle,
  CheckCircle,
  XCircle,
  Building2,
  Copy,
  Plus,
} from 'lucide-react';
import type { Lead, LeadActivity, LeadActivityType, LeadStage, LeadPriority, BudgetRange } from '@/lib/db';

// ─── Constants ───────────────────────────────────────────────────────

const PIPELINE_STAGES: { id: LeadStage; label: string; color: string }[] = [
  { id: 'new', label: 'New', color: 'bg-blue-500' },
  { id: 'contacted', label: 'Contacted', color: 'bg-cyan-500' },
  { id: 'tour_scheduled', label: 'Tour Sched.', color: 'bg-orange-500' },
  { id: 'proposal', label: 'Proposal', color: 'bg-indigo-500' },
  { id: 'won', label: 'Won', color: 'bg-green-500' },
];

const PRIORITY_CONFIG: Record<LeadPriority, { bg: string; text: string; label: string }> = {
  hot: { bg: 'bg-red-100', text: 'text-red-600', label: '🔥 Hot' },
  warm: { bg: 'bg-orange-100', text: 'text-orange-600', label: 'Warm' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-600', label: 'Medium' },
  cold: { bg: 'bg-blue-100', text: 'text-blue-600', label: 'Cold' },
};

const INTEREST_LABELS: Record<string, string> = {
  hot_desk: 'Hot Desk',
  fixed_desk: 'Fixed Desk',
  private_office: 'Private Office',
  meeting_room: 'Meeting Room',
  event_space: 'Event Space',
  virtual_office: 'Virtual Office',
  other: 'Other',
};

const BUDGET_LABELS: Record<BudgetRange, string> = {
  under_1m: '< 1M',
  '1m_3m': '1M – 3M',
  '3m_5m': '3M – 5M',
  '5m_10m': '5M – 10M',
  above_10m: '> 10M',
  unknown: 'Unknown',
};

const ACTIVITY_CONFIG: Record<LeadActivityType, { icon: typeof Phone; color: string; bg: string; label: string }> = {
  call_logged: { icon: Phone, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Call logged' },
  walk_in_logged: { icon: Users, color: 'text-green-600', bg: 'bg-green-100', label: 'Walk-in logged' },
  note_added: { icon: FileText, color: 'text-gray-600', bg: 'bg-gray-100', label: 'Note added' },
  stage_changed: { icon: ArrowRight, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Stage changed' },
  assigned: { icon: UserPlus, color: 'text-cyan-600', bg: 'bg-cyan-100', label: 'Assigned' },
  tour_completed: { icon: MapPin, color: 'text-orange-600', bg: 'bg-orange-100', label: 'Tour completed' },
  proposal_sent: { icon: Send, color: 'text-indigo-600', bg: 'bg-indigo-100', label: 'Proposal sent' },
  follow_up_set: { icon: Calendar, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Follow-up set' },
  email_sent: { icon: Mail, color: 'text-blue-600', bg: 'bg-blue-100', label: 'Email sent' },
  telegram_message: { icon: MessageCircle, color: 'text-sky-600', bg: 'bg-sky-100', label: 'Telegram message' },
  won: { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', label: 'Won' },
  lost: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100', label: 'Lost' },
};

// ─── Helpers ─────────────────────────────────────────────────────────

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getDaysInStage(stageChangedAt: string): number {
  const start = new Date(stageChangedAt);
  const now = new Date();
  return Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatFollowUpDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (eventDay.getTime() === today.getTime()) return 'Today';
  if (eventDay.getTime() === tomorrow.getTime()) return 'Tomorrow';
  if (date < now) return `Overdue: ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function isFollowUpOverdue(dateString: string): boolean {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return eventDay.getTime() < today.getTime();
}

function getActivityDescription(activity: LeadActivity): string {
  if (activity.description) return activity.description;
  // Build description from metadata for auto-generated activities
  const meta = activity.metadata;
  if (activity.activity_type === 'stage_changed' && meta?.from && meta?.to) {
    return `${meta.from} → ${meta.to}`;
  }
  return '';
}

// ─── Props ───────────────────────────────────────────────────────────

interface LeadDetailModalProps {
  lead: Lead;
  onClose: () => void;
  onLeadUpdated: () => void;
}

// ─── Component ───────────────────────────────────────────────────────

export default function LeadDetailModal({ lead, onClose, onLeadUpdated }: LeadDetailModalProps) {
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [loadingActivities, setLoadingActivities] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, [lead.id]);

  const fetchActivities = async () => {
    setLoadingActivities(true);
    try {
      const res = await fetch(`/api/sales/leads/${lead.id}/activities`);
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoadingActivities(false);
    }
  };

  const logActivity = async (activityType: LeadActivityType, description?: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sales/leads/${lead.id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity_type: activityType,
          ...(description && { description }),
        }),
      });

      if (res.ok) {
        await fetchActivities();
        onLeadUpdated();
      }
    } catch (error) {
      console.error('Error logging activity:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogCall = () => {
    logActivity('call_logged');
  };

  const handleAddNote = () => {
    if (!noteText.trim()) return;
    logActivity('note_added', noteText.trim());
    setNoteText('');
    setShowNoteInput(false);
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Fallback: do nothing
    }
  };

  // Pipeline progress: find current stage index (won/lost are terminal)
  const currentStageIndex = PIPELINE_STAGES.findIndex(s => s.id === lead.stage);
  const isLost = lead.stage === 'lost';
  const priority = PRIORITY_CONFIG[lead.priority];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

        {/* ─── Header ──────────────────────────────────────── */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
              <span className="text-purple-700 font-bold text-lg">
                {lead.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{lead.full_name}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1.5">
                {lead.company_name && (
                  <>
                    <Building2 size={14} />
                    {lead.company_name}
                    {lead.position && ` · ${lead.position}`}
                  </>
                )}
                {!lead.company_name && lead.position && lead.position}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${priority.bg} ${priority.text}`}>
              {priority.label}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ─── Scrollable Content ──────────────────────────── */}
        <div className="flex-1 overflow-y-auto">

          {/* Pipeline Progress */}
          <div className="px-6 py-4 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Pipeline Stage</p>
            {isLost ? (
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 text-sm font-medium bg-red-100 text-red-700 rounded-full">Lost</span>
                {lead.lost_reason && (
                  <span className="text-sm text-gray-500">— {lead.lost_reason}</span>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-1">
                  {PIPELINE_STAGES.map((stage, idx) => (
                    <div
                      key={stage.id}
                      className={`flex-1 h-2 rounded-full ${
                        idx <= currentStageIndex ? stage.color : 'bg-gray-200'
                      }`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-1.5">
                  {PIPELINE_STAGES.map((stage, idx) => (
                    <span
                      key={stage.id}
                      className={`text-[10px] ${
                        idx === currentStageIndex
                          ? 'font-semibold text-gray-900'
                          : 'text-gray-400'
                      }`}
                    >
                      {stage.label}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Contact + Details (2-col on desktop) */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

              {/* Contact Info */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Contact</p>
                <div className="space-y-2.5">
                  {lead.phone && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-sm text-gray-700">
                        <Phone size={16} className="text-gray-400 shrink-0" />
                        {lead.phone}
                      </div>
                      <button
                        onClick={() => copyToClipboard(lead.phone!, 'phone')}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                      >
                        <Copy size={12} />
                        {copiedField === 'phone' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  )}
                  {lead.email && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 text-sm text-gray-700">
                        <Mail size={16} className="text-gray-400 shrink-0" />
                        {lead.email}
                      </div>
                      <button
                        onClick={() => copyToClipboard(lead.email!, 'email')}
                        className="text-xs text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                      >
                        <Copy size={12} />
                        {copiedField === 'email' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  )}
                  {!lead.phone && !lead.email && (
                    <p className="text-sm text-gray-400">No contact info</p>
                  )}
                </div>
              </div>

              {/* Details Grid */}
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">Details</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 uppercase">Interest</p>
                    <p className="text-sm font-medium text-gray-900">
                      {INTEREST_LABELS[lead.interest_type] || lead.interest_type}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 uppercase">Team Size</p>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.team_size ? `${lead.team_size} people` : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 uppercase">Budget</p>
                    <p className="text-sm font-medium text-gray-900">
                      {lead.budget_range ? BUDGET_LABELS[lead.budget_range] : '—'}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[10px] text-gray-500 uppercase">Deal Value</p>
                    <p className="text-sm font-medium text-green-600">
                      {lead.deal_value ? `$${lead.deal_value.toLocaleString()}` : '—'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Follow-up + Assignment */}
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Follow-up */}
              {lead.next_follow_up_at ? (
                <div className={`border rounded-lg p-3 flex items-start gap-2.5 ${
                  isFollowUpOverdue(lead.next_follow_up_at)
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <Calendar size={16} className={`mt-0.5 shrink-0 ${
                    isFollowUpOverdue(lead.next_follow_up_at) ? 'text-red-600' : 'text-yellow-600'
                  }`} />
                  <div>
                    <p className={`text-sm font-medium ${
                      isFollowUpOverdue(lead.next_follow_up_at) ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      Follow-up: {formatFollowUpDate(lead.next_follow_up_at)}
                    </p>
                    {lead.next_follow_up_note && (
                      <p className={`text-xs mt-0.5 ${
                        isFollowUpOverdue(lead.next_follow_up_at) ? 'text-red-700' : 'text-yellow-700'
                      }`}>
                        {lead.next_follow_up_note}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 flex items-center gap-2.5 text-gray-400">
                  <Calendar size={16} />
                  <span className="text-sm">No follow-up scheduled</span>
                </div>
              )}

              {/* Assignment */}
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Assigned</p>
                  <p className="text-sm font-medium text-gray-900">
                    {lead.assigned_to_employee?.full_name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">Captured</p>
                  <p className="text-sm font-medium text-gray-900">
                    {lead.captured_by_employee?.full_name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 uppercase">In stage</p>
                  <p className="text-sm font-medium text-gray-900">
                    {getDaysInStage(lead.stage_changed_at)}d
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="px-6 py-4 border-b border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Notes</p>
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{lead.notes}</p>
            </div>
          )}

          {/* Source / Metadata */}
          <div className="px-6 py-3 border-b border-gray-100 flex flex-wrap items-center gap-3 text-xs text-gray-500">
            {lead.source && (
              <span className="px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full font-medium">
                {lead.source.label}
              </span>
            )}
            {lead.industry && <span>Industry: {lead.industry}</span>}
            <span>Created: {new Date(lead.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>

          {/* Activity Timeline */}
          <div className="px-6 py-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-4">Activity Timeline</p>

            {loadingActivities ? (
              <div className="flex justify-center py-6">
                <div className="w-6 h-6 border-3 border-purple-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activities.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No activity yet</p>
            ) : (
              <div className="space-y-0">
                {activities.map((activity, idx) => {
                  const config = ACTIVITY_CONFIG[activity.activity_type] || ACTIVITY_CONFIG.note_added;
                  const Icon = config.icon;
                  const description = getActivityDescription(activity);
                  const isLast = idx === activities.length - 1;

                  return (
                    <div key={activity.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-8 h-8 rounded-full ${config.bg} flex items-center justify-center shrink-0`}>
                          <Icon size={16} className={config.color} />
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-gray-200 my-1" />}
                      </div>
                      <div className={isLast ? '' : 'pb-4'}>
                        <p className="text-sm font-medium text-gray-900">{config.label}</p>
                        {description && (
                          <p className="text-xs text-gray-500">{description}</p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.performed_by_employee?.full_name || 'System'} · {timeAgo(activity.created_at)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ─── Quick Actions (sticky bottom) ───────────────── */}
        <div className="px-6 py-3 border-t border-gray-200 bg-white rounded-b-2xl shrink-0">
          {showNoteInput ? (
            <div className="flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                placeholder="Type a note..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                autoFocus
              />
              <button
                onClick={handleAddNote}
                disabled={!noteText.trim() || submitting}
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                Save
              </button>
              <button
                onClick={() => { setShowNoteInput(false); setNoteText(''); }}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleLogCall}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
              >
                <Phone size={16} />
                Log Call
              </button>
              <button
                onClick={() => setShowNoteInput(true)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Plus size={16} />
                Add Note
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
