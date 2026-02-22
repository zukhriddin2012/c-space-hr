'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Target,
  Search,
  Building2,
  User,
  Calendar,
  Flame,
  ChevronLeft,
  ChevronRight,
  Clock,

  CheckCircle,
  TrendingUp,

} from 'lucide-react';
import type { Lead, LeadStage, LeadPriority } from '@/lib/db';
import { LeadDetailModal } from '@/components/sales';

// ─── Stage column definitions ────────────────────────────────────────
const STAGES: { id: LeadStage; label: string; shortLabel: string; color: string; bgColor: string }[] = [
  { id: 'new', label: 'New', shortLabel: 'New', color: 'text-blue-700', bgColor: 'bg-blue-50 border-blue-200' },
  { id: 'contacted', label: 'Contacted', shortLabel: 'Contact', color: 'text-cyan-700', bgColor: 'bg-cyan-50 border-cyan-200' },
  { id: 'tour_scheduled', label: 'Tour Scheduled', shortLabel: 'Tour', color: 'text-orange-700', bgColor: 'bg-orange-50 border-orange-200' },
  { id: 'proposal', label: 'Proposal', shortLabel: 'Proposal', color: 'text-indigo-700', bgColor: 'bg-indigo-50 border-indigo-200' },
  { id: 'won', label: 'Won', shortLabel: 'Won', color: 'text-green-700', bgColor: 'bg-green-50 border-green-200' },
  { id: 'lost', label: 'Lost', shortLabel: 'Lost', color: 'text-red-700', bgColor: 'bg-red-50 border-red-200' },
];

const PRIORITY_COLORS: Record<LeadPriority, { bg: string; text: string; label: string }> = {
  hot: { bg: 'bg-red-100', text: 'text-red-600', label: 'Hot' },
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

// ─── Helpers ─────────────────────────────────────────────────────────
function getDaysInStage(stageChangedAt: string): number {
  const start = new Date(stageChangedAt);
  const now = new Date();
  return Math.max(1, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
}

function formatFollowUp(dateString: string): { text: string; isOverdue: boolean; isToday: boolean } {
  const date = new Date(dateString);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const eventDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());

  if (eventDay.getTime() === today.getTime()) {
    return { text: 'Today', isOverdue: false, isToday: true };
  }
  if (eventDay.getTime() === tomorrow.getTime()) {
    return { text: 'Tomorrow', isOverdue: false, isToday: false };
  }

  const isOverdue = date < now;
  const text = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return { text, isOverdue, isToday: false };
}

// ─── Types ───────────────────────────────────────────────────────────
interface LeadStats {
  total: number;
  byStage: Record<LeadStage, number>;
  thisMonth: number;
  wonThisMonth: number;
}

// ─── Component ───────────────────────────────────────────────────────
export default function SalesBoardPage() {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [mobileStageIndex, setMobileStageIndex] = useState(0);
  const [stats, setStats] = useState<LeadStats | null>(null);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
    fetchStats();
  }, []);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/sales/leads');
      if (res.ok) {
        const data = await res.json();
        setLeads(data.leads || []);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/sales/leads/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  // ─── Stage change ──────────────────────────────────────────────────
  const handleStageChange = async (leadId: string, newStage: LeadStage, lostReason?: string) => {
    try {
      const body: Record<string, string> = { stage: newStage };
      if (lostReason) body.lost_reason = lostReason;

      const res = await fetch(`/api/sales/leads/${leadId}/stage`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        fetchLeads();
        fetchStats();
      }
    } catch (error) {
      console.error('Error changing stage:', error);
    }
  };

  // ─── Drag & Drop (HTML5 native) ───────────────────────────────────
  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLead(leadId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, targetStage: LeadStage) => {
    e.preventDefault();
    if (!draggedLead) return;

    const lead = leads.find(l => l.id === draggedLead);
    if (!lead || lead.stage === targetStage) {
      setDraggedLead(null);
      return;
    }

    // Lost stage requires a reason
    if (targetStage === 'lost') {
      const reason = window.prompt('Reason for losing this lead:');
      if (!reason || !reason.trim()) {
        setDraggedLead(null);
        return;
      }
      await handleStageChange(draggedLead, targetStage, reason.trim());
    } else {
      await handleStageChange(draggedLead, targetStage);
    }

    setDraggedLead(null);
  };

  // ─── Filtering ─────────────────────────────────────────────────────
  const filteredLeads = leads.filter(l => {
    const q = searchQuery.toLowerCase();
    return (
      l.full_name.toLowerCase().includes(q) ||
      (l.company_name && l.company_name.toLowerCase().includes(q)) ||
      (l.phone && l.phone.includes(q))
    );
  });

  const getLeadsByStage = (stage: LeadStage) => {
    const stageLeads = filteredLeads.filter(l => l.stage === stage);
    // For won/lost, show most recent 10
    if (stage === 'won' || stage === 'lost') {
      return stageLeads
        .sort((a, b) => new Date(b.stage_changed_at).getTime() - new Date(a.stage_changed_at).getTime())
        .slice(0, 10);
    }
    return stageLeads;
  };

  // ─── Mobile ────────────────────────────────────────────────────────
  const currentMobileStage = STAGES[mobileStageIndex];
  const currentStageLeads = getLeadsByStage(currentMobileStage.id);

  // Active = new + contacted + tour_scheduled + proposal
  const activeCount = stats
    ? stats.byStage.new + stats.byStage.contacted + stats.byStage.tour_scheduled + stats.byStage.proposal
    : 0;

  return (
    <div className="min-h-[60vh]">
      {/* Stats Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-purple-50 rounded-lg">
                <Target size={18} className="text-purple-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.total}</p>
                <p className="text-xs sm:text-sm text-gray-500">Total</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
                <Clock size={18} className="text-blue-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{activeCount}</p>
                <p className="text-xs sm:text-sm text-gray-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-green-50 rounded-lg">
                <CheckCircle size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.wonThisMonth}</p>
                <p className="text-xs sm:text-sm text-gray-500">Won (month)</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-3 sm:p-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="p-1.5 sm:p-2 bg-yellow-50 rounded-lg">
                <TrendingUp size={18} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
                <p className="text-xs sm:text-sm text-gray-500">New (month)</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, company, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
          />
        </div>
      </div>

      {/* Board */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* ─── Desktop Board ─────────────────────────────────────── */}
          <div className="hidden md:block overflow-x-auto pb-4">
            <div className="flex gap-4">
              {STAGES.map((stage) => {
                const stageLeads = getLeadsByStage(stage.id);
                return (
                  <div
                    key={stage.id}
                    className="w-[260px] lg:w-[280px] shrink-0 flex flex-col"
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, stage.id)}
                  >
                    {/* Column Header */}
                    <div className={`px-4 py-3 rounded-t-xl border-2 ${stage.bgColor}`}>
                      <div className="flex items-center justify-between">
                        <h3 className={`font-semibold text-sm ${stage.color}`}>{stage.label}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stage.bgColor} ${stage.color}`}>
                          {stageLeads.length}
                        </span>
                      </div>
                    </div>

                    {/* Column Body */}
                    <div className="bg-gray-100 rounded-b-xl p-2 min-h-[400px] max-h-[600px] overflow-y-auto space-y-2">
                      {stageLeads.map((lead) => (
                        <LeadCard
                          key={lead.id}
                          lead={lead}
                          isDragged={draggedLead === lead.id}
                          onDragStart={(e) => handleDragStart(e, lead.id)}
                          onClick={() => setSelectedLead(lead)}
                        />
                      ))}

                      {stageLeads.length === 0 && (
                        <div className="text-center py-8 text-gray-400 text-sm">
                          No leads
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─── Mobile Board ──────────────────────────────────────── */}
          <div className="md:hidden">
            {/* Stage Navigation */}
            <div className="flex items-center justify-between mb-4 bg-white rounded-xl border border-gray-200 p-2">
              <button
                onClick={() => setMobileStageIndex(Math.max(0, mobileStageIndex - 1))}
                disabled={mobileStageIndex === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronLeft size={20} />
              </button>

              <div className="flex-1 text-center">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${currentMobileStage.bgColor}`}>
                  <span className={`font-semibold ${currentMobileStage.color}`}>
                    {currentMobileStage.label}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-sm font-medium bg-white/50 ${currentMobileStage.color}`}>
                    {currentStageLeads.length}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {mobileStageIndex + 1} of {STAGES.length}
                </p>
              </div>

              <button
                onClick={() => setMobileStageIndex(Math.min(STAGES.length - 1, mobileStageIndex + 1))}
                disabled={mobileStageIndex === STAGES.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Stage Dots */}
            <div className="flex justify-center gap-1.5 mb-4">
              {STAGES.map((stage, idx) => (
                <button
                  key={stage.id}
                  onClick={() => setMobileStageIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    idx === mobileStageIndex ? 'bg-purple-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>

            {/* Cards */}
            <div className="space-y-3">
              {currentStageLeads.map((lead) => (
                <MobileLeadCard key={lead.id} lead={lead} onClick={() => setSelectedLead(lead)} />
              ))}

              {currentStageLeads.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Target className="mx-auto mb-3 text-gray-300" size={40} />
                  <p>No leads in {currentMobileStage.label}</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Lead Detail Modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onLeadUpdated={() => { fetchLeads(); fetchStats(); }}
        />
      )}
    </div>
  );
}

// ─── Desktop Lead Card ───────────────────────────────────────────────
function LeadCard({
  lead,
  isDragged,
  onDragStart,
  onClick,
}: {
  lead: Lead;
  isDragged: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onClick: () => void;
}) {
  const priority = PRIORITY_COLORS[lead.priority];
  const daysInStage = getDaysInStage(lead.stage_changed_at);

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`bg-white rounded-lg p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow ${
        isDragged ? 'opacity-50' : ''
      }`}
    >
      <div className="flex items-start gap-2.5">
        {/* Avatar */}
        <div className="w-9 h-9 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-purple-700 font-semibold text-sm">
            {lead.full_name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 text-sm truncate">{lead.full_name}</p>

          {lead.company_name && (
            <p className="text-xs text-gray-500 truncate flex items-center gap-1 mt-0.5">
              <Building2 size={10} />
              {lead.company_name}
            </p>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-1 mt-2">
            {/* Priority */}
            <span className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${priority.bg} ${priority.text}`}>
              <Flame size={9} />
              {priority.label}
            </span>

            {/* Days in stage */}
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {daysInStage}d
            </span>

            {/* Source */}
            {lead.source && (
              <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded-full truncate max-w-[80px]">
                {lead.source.label}
              </span>
            )}

            {/* Interest type */}
            {lead.interest_type && INTEREST_LABELS[lead.interest_type] && (
              <span className="text-xs px-1.5 py-0.5 bg-teal-100 text-teal-600 rounded-full">
                {INTEREST_LABELS[lead.interest_type]}
              </span>
            )}

            {/* Follow-up */}
            {lead.next_follow_up_at && (() => {
              const info = formatFollowUp(lead.next_follow_up_at);
              return (
                <span className={`text-xs px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                  info.isOverdue
                    ? 'bg-red-100 text-red-600'
                    : info.isToday
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  <Calendar size={9} />
                  {info.isOverdue ? 'Overdue' : info.text}
                </span>
              );
            })()}
          </div>

          {/* Assigned to */}
          {lead.assigned_to_employee && (
            <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1 truncate">
              <User size={10} />
              {lead.assigned_to_employee.full_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Mobile Lead Card ────────────────────────────────────────────────
function MobileLeadCard({ lead, onClick }: { lead: Lead; onClick: () => void }) {
  const priority = PRIORITY_COLORS[lead.priority];
  const daysInStage = getDaysInStage(lead.stage_changed_at);

  return (
    <div onClick={onClick} className="bg-white rounded-xl p-4 border border-gray-200 cursor-pointer active:bg-gray-50">
      <div className="flex items-start gap-3">
        <div className="w-11 h-11 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-purple-700 font-semibold">
            {lead.full_name.charAt(0).toUpperCase()}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900">{lead.full_name}</p>
          {lead.company_name && (
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Building2 size={12} />
              {lead.company_name}
            </p>
          )}

          <div className="flex flex-wrap gap-1.5 mt-2">
            <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5 ${priority.bg} ${priority.text}`}>
              <Flame size={10} />
              {priority.label}
            </span>

            <span className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
              {daysInStage}d
            </span>

            {lead.source && (
              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-600 rounded-full">
                {lead.source.label}
              </span>
            )}

            {lead.interest_type && INTEREST_LABELS[lead.interest_type] && (
              <span className="text-xs px-2 py-0.5 bg-teal-100 text-teal-600 rounded-full">
                {INTEREST_LABELS[lead.interest_type]}
              </span>
            )}

            {lead.next_follow_up_at && (() => {
              const info = formatFollowUp(lead.next_follow_up_at);
              return (
                <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                  info.isOverdue
                    ? 'bg-red-100 text-red-600'
                    : info.isToday
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-orange-100 text-orange-600'
                }`}>
                  <Calendar size={10} />
                  {info.isOverdue ? 'Overdue' : info.text}
                </span>
              );
            })()}
          </div>

          {lead.assigned_to_employee && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <User size={11} />
              {lead.assigned_to_employee.full_name}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
