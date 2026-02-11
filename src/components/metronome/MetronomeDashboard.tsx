'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { RefreshCw, ChevronRight, CheckCircle, Circle, MoreVertical, Plus, AlertTriangle, HelpCircle } from 'lucide-react';
import PulseBar from './PulseBar';
import MonthCalendar from './MonthCalendar';
import DecisionCard from './DecisionCard';
import InitiativeCard from './InitiativeCard';
import MeetingMode from './MeetingMode';
import NewInitiativeModal from './NewInitiativeModal';
import OnboardingOverlay, { ONBOARDING_STEPS } from './OnboardingOverlay';
import { expandRecurringEvents } from '@/lib/utils/recurrence';
import type {
  MetronomeSummary,
  MetronomeInitiativeRow,
  MetronomeActionItemRow,
  MetronomeDecisionRow,
  MetronomeKeyDateRow,
} from '@/lib/db/metronome';
import type { UserRole } from '@/types';

interface MetronomeDashboardProps {
  userId: string;
  userRole: UserRole;
  canEdit: boolean;
  canCreate: boolean;
  canRunMeeting: boolean;
  canManageDates: boolean;
}

export default function MetronomeDashboard({
  userId,
  userRole: _userRole,
  canEdit,
  canCreate,
  canRunMeeting,
  canManageDates: _canManageDates,
}: MetronomeDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<MetronomeSummary | null>(null);
  const [initiatives, setInitiatives] = useState<MetronomeInitiativeRow[]>([]);
  const [decisions, setDecisions] = useState<MetronomeDecisionRow[]>([]);
  const [keyDates, setKeyDates] = useState<MetronomeKeyDateRow[]>([]);
  const [actionItemsMap, setActionItemsMap] = useState<Record<string, MetronomeActionItemRow[]>>({});
  const [showMeeting, setShowMeeting] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'decide-track' | 'calendar-plan'>('decide-track');
  const [isResolvedExpanded, setIsResolvedExpanded] = useState(false);
  const [latestSyncId, setLatestSyncId] = useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Current month for calendar
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());

  // Tab persistence via URL hash
  useEffect(() => {
    const hash = window.location.hash.replace('#', '');
    if (hash === 'plan') setActiveTab('calendar-plan');
  }, []);

  // AT-20: Auto-show onboarding on first visit
  useEffect(() => {
    const key = `metronome-onboarding-${userId}`;
    if (typeof window !== 'undefined' && !localStorage.getItem(key)) {
      setShowOnboarding(true);
    }
  }, [userId]);

  const handleOnboardingComplete = () => {
    localStorage.setItem(`metronome-onboarding-${userId}`, 'true');
    setShowOnboarding(false);
  };

  const handleTabChange = (tab: 'decide-track' | 'calendar-plan') => {
    setActiveTab(tab);
    window.location.hash = tab === 'calendar-plan' ? 'plan' : 'track';
  };

  // AT-23: Expand recurring events for calendar view
  const expandedKeyDates = useMemo(() => {
    const viewStart = new Date(calYear, calMonth, 1);
    const viewEnd = new Date(calYear, calMonth + 1, 0);
    return expandRecurringEvents(keyDates, viewStart, viewEnd);
  }, [keyDates, calYear, calMonth]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const monthStart = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(calYear, calMonth + 1, 0).getDate();
      const monthEnd = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${lastDay}`;

      // SEC-H3: Fetch all action items in a single request instead of N+1
      const [summaryRes, initRes, decRes, datesRes, allItemsRes, syncsRes] = await Promise.all([
        fetch('/api/metronome/syncs/summary'),
        fetch('/api/metronome/initiatives'),
        fetch('/api/metronome/decisions?status=open'),
        fetch(`/api/metronome/key-dates?from=${monthStart}&to=${monthEnd}`),
        fetch('/api/metronome/action-items'),
        fetch('/api/metronome/syncs?limit=1'),
      ]);

      if (summaryRes.ok) {
        const { data } = await summaryRes.json();
        setSummary(data);
      }

      if (initRes.ok) {
        const { data } = await initRes.json();
        setInitiatives(data || []);
      }

      // SEC-H3: Group all action items by initiative_id client-side
      if (allItemsRes.ok) {
        const { data: allItems } = await allItemsRes.json();
        const itemsMap: Record<string, MetronomeActionItemRow[]> = {};
        for (const item of (allItems || [])) {
          if (!itemsMap[item.initiative_id]) {
            itemsMap[item.initiative_id] = [];
          }
          itemsMap[item.initiative_id].push(item);
        }
        setActionItemsMap(itemsMap);
      }

      if (decRes.ok) {
        const { data } = await decRes.json();
        setDecisions(data || []);
      }

      if (datesRes.ok) {
        const { data } = await datesRes.json();
        setKeyDates(data || []);
      }

      if (syncsRes.ok) {
        const { data: syncsData } = await syncsRes.json();
        if (syncsData && syncsData.length > 0) {
          setLatestSyncId(syncsData[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching metronome data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, [calYear, calMonth]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleMonthChange = (year: number, month: number) => {
    setCalYear(year);
    setCalMonth(month);
  };

  // SEC-H2: Action handlers with optimistic updates + rollback on failure
  const handleToggleAction = async (actionId: string) => {
    // Save previous state for rollback
    const prevMap = { ...actionItemsMap };

    // Optimistic update
    setActionItemsMap(prev => {
      const updated = { ...prev };
      for (const initId of Object.keys(updated)) {
        updated[initId] = updated[initId].map(item => {
          if (item.id === actionId) {
            return {
              ...item,
              status: item.status === 'done' ? 'pending' as const : 'done' as const,
              completed_at: item.status === 'done' ? null : new Date().toISOString(),
            };
          }
          return item;
        });
      }
      return updated;
    });

    try {
      const res = await fetch('/api/metronome/action-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id: actionId }),
      });
      if (!res.ok) {
        setActionItemsMap(prevMap);
        setError('Failed to toggle action item');
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setActionItemsMap(prevMap);
      setError('Network error — changes reverted');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDecide = async (decisionId: string, decisionText: string) => {
    const prevDecisions = [...decisions];

    setDecisions(prev =>
      prev.map(d => d.id === decisionId ? { ...d, status: 'decided' as const, decision_text: decisionText } : d)
    );

    try {
      const res = await fetch('/api/metronome/decisions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'decide', id: decisionId, decision_text: decisionText }),
      });
      if (!res.ok) {
        setDecisions(prevDecisions);
        setError('Failed to save decision');
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setDecisions(prevDecisions);
      setError('Network error — decision reverted');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDefer = async (decisionId: string) => {
    const prevDecisions = [...decisions];

    setDecisions(prev => prev.filter(d => d.id !== decisionId));

    try {
      const res = await fetch('/api/metronome/decisions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'defer', id: decisionId }),
      });
      if (!res.ok) {
        setDecisions(prevDecisions);
        setError('Failed to defer decision');
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setDecisions(prevDecisions);
      setError('Network error — decision reverted');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleEndMeeting = async (data: {
    notes: string;
    nextSyncDate: string;
    nextSyncFocus: string;
    duration: number;
    itemsDiscussed: number;
    decisionsMade: number;
    actionItemsDone: number;
  }) => {
    try {
      const res = await fetch('/api/metronome/syncs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sync_date: `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`,
          title: 'Leadership Sync',
          notes: data.notes || null,
          attendee_ids: [],
          started_at: new Date(Date.now() - data.duration * 1000).toISOString(),
          ended_at: new Date().toISOString(),
          duration_seconds: data.duration,
          next_sync_date: data.nextSyncDate || null,
          next_sync_focus: data.nextSyncFocus || null,
          focus_areas: [],
          items_discussed: data.itemsDiscussed,
          decisions_made: data.decisionsMade,
          action_items_completed: data.actionItemsDone,
        }),
      });

      if (!res.ok) {
        setError('Failed to save meeting record — please try again');
        setTimeout(() => setError(null), 5000);
        return;
      }

      setShowMeeting(false);
      fetchData();
    } catch {
      setError('Network error — meeting record not saved');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleCreateInitiative = async (data: {
    title: string;
    description: string | null;
    function_tag: string;
    priority: string;
    owner_label: string | null;
    status_label: string | null;
    deadline: string | null;
    deadline_label: string | null;
  }) => {
    try {
      const res = await fetch('/api/metronome/initiatives', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Failed to create initiative' }));
        setError(err.error || 'Failed to create initiative');
        setTimeout(() => setError(null), 5000);
        return;
      }

      setShowNewForm(false);
      fetchData();
    } catch {
      setError('Network error — initiative not created');
      setTimeout(() => setError(null), 5000);
    }
  };

  const handleAddAction = async (initiativeId: string, title: string, deadline?: string) => {
    try {
      const res = await fetch('/api/metronome/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initiative_id: initiativeId,
          title,
          deadline: deadline || null,
        }),
      });
      if (res.ok) {
        fetchData();
      } else {
        setError('Failed to add task');
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError('Network error — task not added');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateAction = async (actionId: string, updates: Record<string, unknown>) => {
    try {
      const res = await fetch('/api/metronome/action-items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: actionId, ...updates }),
      });
      if (res.ok) {
        fetchData();
      } else {
        setError('Failed to update task');
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError('Network error — task not updated');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteAction = async (actionId: string) => {
    const prevMap = { ...actionItemsMap };

    // Optimistic: remove from map
    setActionItemsMap(prev => {
      const updated = { ...prev };
      for (const initId of Object.keys(updated)) {
        updated[initId] = updated[initId].filter(item => item.id !== actionId);
      }
      return updated;
    });

    try {
      const res = await fetch('/api/metronome/action-items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: actionId }),
      });
      if (!res.ok) {
        setActionItemsMap(prevMap);
        setError('Failed to delete task');
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setActionItemsMap(prevMap);
      setError('Network error — deletion reverted');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleResolveInitiative = async (id: string) => {
    try {
      const res = await fetch(`/api/metronome/initiatives/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', priority: 'resolved' }),
      });
      if (res.ok) {
        fetchData();
      } else {
        setError('Failed to resolve initiative');
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError('Network error');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleRestoreInitiative = async (id: string) => {
    try {
      const res = await fetch(`/api/metronome/initiatives/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', priority: 'strategic' }),
      });
      if (res.ok) {
        fetchData();
      } else {
        setError('Failed to restore initiative');
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError('Network error');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleUpdateNextSync = async (date: string, focus: string) => {
    if (!latestSyncId) return;
    try {
      const body: Record<string, string> = {};
      if (date) body.next_sync_date = date;
      if (focus) body.next_sync_focus = focus;

      const res = await fetch(`/api/metronome/syncs/${latestSyncId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchData();
      } else {
        setError('Failed to update next sync');
        setTimeout(() => setError(null), 3000);
      }
    } catch {
      setError('Network error');
      setTimeout(() => setError(null), 3000);
    }
  };

  // Active vs Resolved split
  const activeInitiatives = initiatives.filter(
    (i) => i.priority !== 'resolved' && !i.is_archived
  );
  const resolvedInitiatives = initiatives.filter(
    (i) => i.priority === 'resolved' || i.is_archived
  );

  // Further split active into needsAttention vs inProgress
  const needsAttention = activeInitiatives.filter((i) => {
    const items = actionItemsMap[i.id] || [];
    const hasOverdue = items.some(
      (a) => a.deadline && new Date(a.deadline) < new Date() && a.status !== 'done'
    );
    return i.priority === 'critical' || hasOverdue;
  });
  const inProgress = activeInitiatives.filter(
    (i) => !needsAttention.includes(i)
  );

  // Open decisions only
  const openDecisions = decisions.filter(d => d.status === 'open');

  // SEC-L1: Determine if user can mutate (decide/defer/toggle)
  const canMutate = canEdit || canRunMeeting;

  // Upcoming deadlines computation (AT-18)
  const upcomingDeadlines = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const endOfThisWeek = new Date(today);
    endOfThisWeek.setDate(endOfThisWeek.getDate() + (7 - endOfThisWeek.getDay()));
    const endOfNextWeek = new Date(endOfThisWeek);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

    const allItems = Object.entries(actionItemsMap).flatMap(([initId, items]) => {
      const init = initiatives.find(i => i.id === initId);
      return items
        .filter(a => a.deadline && a.status !== 'done')
        .map(a => ({ ...a, initiativeTitle: init?.title || 'Unknown' }));
    });

    const overdue = allItems
      .filter(a => new Date(a.deadline!) < today)
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
    const thisWeek = allItems
      .filter(a => { const d = new Date(a.deadline!); return d >= today && d <= endOfThisWeek; })
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());
    const nextWeek = allItems
      .filter(a => { const d = new Date(a.deadline!); return d > endOfThisWeek && d <= endOfNextWeek; })
      .sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime());

    return { overdue, thisWeek, nextWeek };
  }, [actionItemsMap, initiatives]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw size={24} className="animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error toast */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Metronome Sync</h1>
        <p className="text-sm text-gray-500">Leadership Initiative Tracker</p>
      </div>

      {/* Pulse Bar */}
      {summary && (
        <div data-onboarding="pulse-bar">
          <PulseBar
            summary={summary}
            canRunMeeting={canRunMeeting}
            canCreate={canCreate}
            onStartSync={() => setShowMeeting(true)}
            onNewInitiative={() => setShowNewForm(true)}
            onUpdateNextSync={canRunMeeting ? handleUpdateNextSync : undefined}
            onShowOnboarding={() => setShowOnboarding(true)}
            latestSyncId={latestSyncId || undefined}
          />
        </div>
      )}

      {/* Tab bar */}
      <div className="flex border-b border-gray-200">
        <div data-onboarding="tab-decide-track">
          <TabButton
            label="Decide & Track"
            count={activeInitiatives.length + openDecisions.length}
            active={activeTab === 'decide-track'}
            onClick={() => handleTabChange('decide-track')}
          />
        </div>
        <div data-onboarding="tab-calendar-plan">
          <TabButton
            label="Calendar & Plan"
            active={activeTab === 'calendar-plan'}
            onClick={() => handleTabChange('calendar-plan')}
          />
        </div>
      </div>

      {/* Decide & Track Tab */}
      {activeTab === 'decide-track' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* DECIDE Column */}
          <div data-onboarding="decisions-panel">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Decide ({openDecisions.length})
            </h2>
            {openDecisions.length === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <p className="text-sm text-green-700">All decisions resolved</p>
              </div>
            ) : (
              <div className="space-y-3">
                {openDecisions.map(dec => (
                  <DecisionCard
                    key={dec.id}
                    decision={dec}
                    onDecide={canMutate ? handleDecide : undefined}
                    onDefer={canMutate ? handleDefer : undefined}
                  />
                ))}
              </div>
            )}
          </div>

          {/* TRACK Column */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Track ({activeInitiatives.length})
            </h2>

            {needsAttention.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-red-600 uppercase mb-2">Needs Attention</p>
                <div className="space-y-3">
                  {needsAttention.map(init => (
                    <InitiativeCard
                      key={init.id}
                      initiative={init}
                      actionItems={actionItemsMap[init.id] || []}
                      onToggleAction={canMutate ? handleToggleAction : undefined}
                      onAddAction={canMutate ? handleAddAction : undefined}
                      onUpdateAction={canMutate ? handleUpdateAction : undefined}
                      onDeleteAction={canMutate ? handleDeleteAction : undefined}
                      onResolve={canMutate ? handleResolveInitiative : undefined}
                      canEdit={canMutate}
                    />
                  ))}
                </div>
              </div>
            )}

            {inProgress.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">In Progress</p>
                <div className="space-y-3">
                  {inProgress.map(init => (
                    <InitiativeCard
                      key={init.id}
                      initiative={init}
                      actionItems={actionItemsMap[init.id] || []}
                      onToggleAction={canMutate ? handleToggleAction : undefined}
                      onAddAction={canMutate ? handleAddAction : undefined}
                      onUpdateAction={canMutate ? handleUpdateAction : undefined}
                      onDeleteAction={canMutate ? handleDeleteAction : undefined}
                      onResolve={canMutate ? handleResolveInitiative : undefined}
                      canEdit={canMutate}
                    />
                  ))}
                </div>
              </div>
            )}

            {activeInitiatives.length === 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-500">No active initiatives</p>
              </div>
            )}

            {/* Resolved Section (AT-03, AT-04) */}
            {resolvedInitiatives.length > 0 && (
              <div className="mt-6">
                <button
                  onClick={() => setIsResolvedExpanded(!isResolvedExpanded)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  <ChevronRight className={`h-4 w-4 transition-transform ${isResolvedExpanded ? 'rotate-90' : ''}`} />
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Resolved ({resolvedInitiatives.length})</span>
                </button>

                <div className={`overflow-hidden transition-all duration-300 ${
                  isResolvedExpanded ? 'max-h-[2000px] opacity-100 mt-3' : 'max-h-0 opacity-0'
                }`}>
                  <div className="space-y-3">
                    {resolvedInitiatives.map((init) => (
                      <InitiativeCard
                        key={init.id}
                        initiative={init}
                        actionItems={actionItemsMap[init.id] || []}
                        onToggleAction={canMutate ? handleToggleAction : undefined}
                        onRestore={canMutate ? handleRestoreInitiative : undefined}
                        canEdit={canMutate}
                        isResolved
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* PLAN Column */}
          <div>
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wider mb-3">
              Plan
            </h2>

            {/* Upcoming key dates */}
            <div className="bg-white border border-gray-200 rounded-lg p-3 mb-3">
              <p className="text-xs font-medium text-gray-500 uppercase mb-2">Upcoming</p>
              {keyDates.filter(kd => new Date(kd.date) >= new Date()).slice(0, 5).length > 0 ? (
                <div className="space-y-2">
                  {keyDates
                    .filter(kd => new Date(kd.date) >= new Date())
                    .slice(0, 5)
                    .map(kd => (
                      <div key={kd.id} className="flex items-center gap-2 text-sm">
                        <span className="text-xs text-gray-400 w-12">
                          {new Date(kd.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                        <span className="text-gray-700">{kd.emoji || ''} {kd.title}</span>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No upcoming dates</p>
              )}
            </div>

            {/* This week's focus (from last sync) */}
            {summary?.nextSync.date && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-purple-600 uppercase mb-1">Next Sync</p>
                <p className="text-sm font-medium text-purple-800">
                  {new Date(summary.nextSync.date).toLocaleDateString('en-US', {
                    weekday: 'short', month: 'short', day: 'numeric'
                  })}
                </p>
                {summary.nextSync.daysUntil !== null && (
                  <p className="text-xs text-purple-600 mt-0.5">
                    {summary.nextSync.daysUntil === 0 ? 'Today' :
                     summary.nextSync.daysUntil === 1 ? 'Tomorrow' :
                     `In ${summary.nextSync.daysUntil} days`}
                  </p>
                )}
              </div>
            )}

            {/* Summary */}
            {summary && (
              <div className="bg-white border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-medium text-gray-500 uppercase mb-1">Summary</p>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-purple-600">{summary.totalActive}</p>
                    <p className="text-[10px] text-gray-500">Active</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-green-600">{summary.onTrackPercentage}%</p>
                    <p className="text-[10px] text-gray-500">On Track</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Calendar & Plan Tab (AT-02) */}
      {activeTab === 'calendar-plan' && (
        <div>
          <MonthCalendar keyDates={expandedKeyDates} onMonthChange={handleMonthChange} />

          {/* Upcoming Deadlines Section (AT-18) */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Upcoming Deadlines</h3>

            {upcomingDeadlines.overdue.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-red-600 mb-1">Overdue</p>
                {upcomingDeadlines.overdue.map(item => (
                  <div key={item.id} className="flex items-center gap-2 py-1 text-sm">
                    <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                    <span className="flex-1 truncate">{item.title}</span>
                    <span className="text-xs text-gray-400 truncate max-w-[120px]">{item.initiativeTitle}</span>
                    <span className="text-xs text-red-600">{item.deadline ? new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                  </div>
                ))}
              </div>
            )}

            {upcomingDeadlines.thisWeek.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Due This Week</p>
                {upcomingDeadlines.thisWeek.map(item => (
                  <div key={item.id} className="flex items-center gap-2 py-1 text-sm">
                    <Circle className="h-3 w-3 text-gray-300 shrink-0" />
                    <span className="flex-1 truncate">{item.title}</span>
                    <span className="text-xs text-gray-400 truncate max-w-[120px]">{item.initiativeTitle}</span>
                    <span className="text-xs text-gray-500">{item.deadline ? new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                  </div>
                ))}
              </div>
            )}

            {upcomingDeadlines.nextWeek.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 mb-1">Due Next Week</p>
                {upcomingDeadlines.nextWeek.map(item => (
                  <div key={item.id} className="flex items-center gap-2 py-1 text-sm">
                    <Circle className="h-3 w-3 text-gray-300 shrink-0" />
                    <span className="flex-1 truncate">{item.title}</span>
                    <span className="text-xs text-gray-400 truncate max-w-[120px]">{item.initiativeTitle}</span>
                    <span className="text-xs text-gray-500">{item.deadline ? new Date(item.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}</span>
                  </div>
                ))}
              </div>
            )}

            {upcomingDeadlines.overdue.length === 0 && upcomingDeadlines.thisWeek.length === 0 && upcomingDeadlines.nextWeek.length === 0 && (
              <p className="text-sm text-gray-400 italic">No upcoming deadlines</p>
            )}
          </div>

          {/* Upcoming key dates */}
          <div className="mt-6 bg-white border border-gray-200 rounded-lg p-3">
            <p className="text-xs font-medium text-gray-500 uppercase mb-2">Upcoming Key Dates</p>
            {keyDates.filter(kd => new Date(kd.date) >= new Date()).slice(0, 5).length > 0 ? (
              <div className="space-y-2">
                {keyDates
                  .filter(kd => new Date(kd.date) >= new Date())
                  .slice(0, 5)
                  .map(kd => (
                    <div key={kd.id} className="flex items-center gap-2 text-sm">
                      <span className="text-xs text-gray-400 w-12">
                        {new Date(kd.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-gray-700">{kd.emoji || ''} {kd.title}</span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">No upcoming dates</p>
            )}
          </div>
        </div>
      )}

      {/* Meeting Mode Overlay */}
      {showMeeting && (
        <MeetingMode
          initiatives={initiatives}
          actionItems={actionItemsMap}
          decisions={decisions}
          userId={userId}
          onEnd={handleEndMeeting}
          onClose={() => setShowMeeting(false)}
          onToggleAction={handleToggleAction}
          onDecide={handleDecide}
        />
      )}

      {/* New Initiative Modal */}
      {showNewForm && (
        <NewInitiativeModal
          onSave={handleCreateInitiative}
          onClose={() => setShowNewForm(false)}
        />
      )}

      {/* AT-19, AT-20: Onboarding Overlay */}
      {showOnboarding && (
        <OnboardingOverlay
          steps={ONBOARDING_STEPS}
          onComplete={handleOnboardingComplete}
          onSkip={handleOnboardingComplete}
        />
      )}
    </div>
  );
}

function TabButton({ label, count, active, onClick }: {
  label: string;
  count?: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
        active
          ? 'border-purple-600 text-purple-600 font-semibold'
          : 'border-transparent text-gray-500 hover:text-gray-700'
      }`}
    >
      {label}
      {count !== undefined && (
        <span className={`ml-1.5 px-1.5 py-0.5 text-xs rounded-full ${
          active ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}
