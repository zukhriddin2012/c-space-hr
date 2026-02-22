import { supabaseAdmin, isSupabaseAdminConfigured } from './connection';

// ============================================
// TYPES
// ============================================

export type LeadStage = 'new' | 'contacted' | 'tour_scheduled' | 'proposal' | 'won' | 'lost';
export type LeadPriority = 'hot' | 'warm' | 'medium' | 'cold';
export type InterestType = 'hot_desk' | 'fixed_desk' | 'private_office' | 'meeting_room' | 'event_space' | 'virtual_office' | 'other';
export type BudgetRange = 'under_1m' | '1m_3m' | '3m_5m' | '5m_10m' | 'above_10m' | 'unknown';
export type LeadActivityType =
  | 'call_logged'
  | 'walk_in_logged'
  | 'note_added'
  | 'stage_changed'
  | 'assigned'
  | 'tour_completed'
  | 'proposal_sent'
  | 'follow_up_set'
  | 'email_sent'
  | 'telegram_message'
  | 'won'
  | 'lost';

export interface LeadSource {
  id: string;
  label: string;
  icon: string | null;
  is_active: boolean;
  display_order: number;
}

export interface Lead {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  company_name: string | null;
  industry: string | null;
  position: string | null;
  source_id: string;
  source_details: string | null;
  interest_type: InterestType;
  team_size: number | null;
  budget_range: BudgetRange | null;
  stage: LeadStage;
  stage_changed_at: string;
  lost_reason: string | null;
  assigned_to: string | null;
  captured_by: string;
  branch_id: string;
  priority: LeadPriority;
  next_follow_up_at: string | null;
  next_follow_up_note: string | null;
  client_id: string | null;
  deal_value: number | null;
  notes: string | null;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  source?: { id: string; label: string; icon: string | null };
  captured_by_employee?: { id: string; full_name: string };
  assigned_to_employee?: { id: string; full_name: string } | null;
  client?: { id: string; name: string } | null;
}

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: LeadActivityType;
  description: string | null;
  metadata: Record<string, unknown>;
  performed_by: string;
  created_at: string;
  // Joined
  performed_by_employee?: { id: string; full_name: string };
}

// ============================================
// SHARED SELECT PATTERNS
// ============================================

const LEAD_SELECT = `
  *,
  source:lead_sources!source_id(id, label, icon),
  captured_by_employee:employees!leads_captured_by_fkey(id, full_name),
  assigned_to_employee:employees!leads_assigned_to_fkey(id, full_name),
  client:clients!leads_client_id_fkey(id, name)
`;

const ACTIVITY_SELECT = `
  *,
  performed_by_employee:employees!lead_activities_performed_by_fkey(id, full_name)
`;

// ============================================
// LEAD SOURCES
// ============================================

export async function getLeadSources(): Promise<LeadSource[]> {
  if (!isSupabaseAdminConfigured()) {
    return [];
  }

  const { data, error } = await supabaseAdmin!
    .from('lead_sources')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching lead sources:', error);
    return [];
  }

  return data || [];
}

// ============================================
// LEADS — READ
// ============================================

export async function getLeads(options: {
  branchId?: string;
  stage?: LeadStage;
  assignedTo?: string;
  capturedBy?: string;
  priority?: LeadPriority;
  sourceId?: string;
  isArchived?: boolean;
} = {}): Promise<Lead[]> {
  if (!isSupabaseAdminConfigured()) {
    return [];
  }

  let query = supabaseAdmin!
    .from('leads')
    .select(LEAD_SELECT)
    .order('created_at', { ascending: false });

  // Default: exclude archived leads unless explicitly requested
  query = query.eq('is_archived', options.isArchived ?? false);

  if (options.branchId) {
    query = query.eq('branch_id', options.branchId);
  }
  if (options.stage) {
    query = query.eq('stage', options.stage);
  }
  if (options.assignedTo) {
    query = query.eq('assigned_to', options.assignedTo);
  }
  if (options.capturedBy) {
    query = query.eq('captured_by', options.capturedBy);
  }
  if (options.priority) {
    query = query.eq('priority', options.priority);
  }
  if (options.sourceId) {
    query = query.eq('source_id', options.sourceId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching leads:', error);
    return [];
  }

  return data || [];
}

export async function getLeadById(id: string): Promise<Lead | null> {
  if (!isSupabaseAdminConfigured()) {
    return null;
  }

  const { data, error } = await supabaseAdmin!
    .from('leads')
    .select(LEAD_SELECT)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching lead:', error);
    return null;
  }

  return data;
}

// ============================================
// LEADS — WRITE
// ============================================

export async function createLead(leadData: {
  full_name: string;
  source_id: string;
  interest_type: InterestType;
  captured_by: string;
  branch_id: string;
  phone?: string | null;
  email?: string | null;
  company_name?: string | null;
  industry?: string | null;
  position?: string | null;
  source_details?: string | null;
  team_size?: number | null;
  budget_range?: BudgetRange | null;
  priority?: LeadPriority;
  assigned_to?: string | null;
  next_follow_up_at?: string | null;
  next_follow_up_note?: string | null;
  deal_value?: number | null;
  notes?: string | null;
}): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  if (!isSupabaseAdminConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  const { data, error } = await supabaseAdmin!
    .from('leads')
    .insert({
      ...leadData,
      stage: 'new',
      priority: leadData.priority ?? 'medium',
      is_archived: false,
    })
    .select(LEAD_SELECT)
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    return { success: false, error: error.message };
  }

  return { success: true, lead: data };
}

export async function updateLead(
  id: string,
  updates: {
    full_name?: string;
    phone?: string | null;
    email?: string | null;
    company_name?: string | null;
    industry?: string | null;
    position?: string | null;
    source_id?: string;
    source_details?: string | null;
    interest_type?: InterestType;
    team_size?: number | null;
    budget_range?: BudgetRange | null;
    priority?: LeadPriority;
    next_follow_up_at?: string | null;
    next_follow_up_note?: string | null;
    deal_value?: number | null;
    notes?: string | null;
    lost_reason?: string | null;
    client_id?: string | null;
  }
): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  if (!isSupabaseAdminConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  const { data, error } = await supabaseAdmin!
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select(LEAD_SELECT)
    .single();

  if (error) {
    console.error('Error updating lead:', error);
    return { success: false, error: error.message };
  }

  return { success: true, lead: data };
}

export async function updateLeadStage(
  id: string,
  newStage: LeadStage,
  performedBy: string,
  lostReason?: string
): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  if (!isSupabaseAdminConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  // Get current lead to record the "from" stage
  const currentLead = await getLeadById(id);
  if (!currentLead) {
    return { success: false, error: 'Lead not found' };
  }

  const updates: Record<string, unknown> = {
    stage: newStage,
    stage_changed_at: new Date().toISOString(),
  };

  if (newStage === 'lost' && lostReason) {
    updates.lost_reason = lostReason;
  }

  const { data, error } = await supabaseAdmin!
    .from('leads')
    .update(updates)
    .eq('id', id)
    .select(LEAD_SELECT)
    .single();

  if (error) {
    console.error('Error updating lead stage:', error);
    return { success: false, error: error.message };
  }

  // Auto-create stage_changed activity
  await createLeadActivity({
    lead_id: id,
    activity_type: 'stage_changed',
    description: `Stage changed from ${currentLead.stage} to ${newStage}`,
    metadata: { from: currentLead.stage, to: newStage },
    performed_by: performedBy,
  });

  return { success: true, lead: data };
}

export async function assignLead(
  id: string,
  assignedTo: string,
  performedBy: string
): Promise<{ success: boolean; lead?: Lead; error?: string }> {
  if (!isSupabaseAdminConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  // Get current lead to record the previous assignment
  const currentLead = await getLeadById(id);
  if (!currentLead) {
    return { success: false, error: 'Lead not found' };
  }

  const { data, error } = await supabaseAdmin!
    .from('leads')
    .update({ assigned_to: assignedTo })
    .eq('id', id)
    .select(LEAD_SELECT)
    .single();

  if (error) {
    console.error('Error assigning lead:', error);
    return { success: false, error: error.message };
  }

  // Auto-create assigned activity
  await createLeadActivity({
    lead_id: id,
    activity_type: 'assigned',
    description: `Lead assigned`,
    metadata: {
      from_employee_id: currentLead.assigned_to,
      to_employee_id: assignedTo,
    },
    performed_by: performedBy,
  });

  return { success: true, lead: data };
}

export async function archiveLead(id: string): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseAdminConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  const { error } = await supabaseAdmin!
    .from('leads')
    .update({ is_archived: true })
    .eq('id', id);

  if (error) {
    console.error('Error archiving lead:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ============================================
// LEAD ACTIVITIES
// ============================================

export async function getLeadActivities(leadId: string): Promise<LeadActivity[]> {
  if (!isSupabaseAdminConfigured()) {
    return [];
  }

  const { data, error } = await supabaseAdmin!
    .from('lead_activities')
    .select(ACTIVITY_SELECT)
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching lead activities:', error);
    return [];
  }

  return data || [];
}

export async function createLeadActivity(activityData: {
  lead_id: string;
  activity_type: LeadActivityType;
  performed_by: string;
  description?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; activity?: LeadActivity; error?: string }> {
  if (!isSupabaseAdminConfigured()) {
    return { success: false, error: 'Database not configured' };
  }

  const { data, error } = await supabaseAdmin!
    .from('lead_activities')
    .insert({
      ...activityData,
      metadata: activityData.metadata ?? {},
    })
    .select(ACTIVITY_SELECT)
    .single();

  if (error) {
    console.error('Error creating lead activity:', error);
    return { success: false, error: error.message };
  }

  return { success: true, activity: data };
}

// ============================================
// STATS
// ============================================

export async function getLeadStats(branchId?: string): Promise<{
  total: number;
  byStage: Record<LeadStage, number>;
  bySource: Record<string, number>;
  byPriority: Record<LeadPriority, number>;
  thisMonth: number;
  wonThisMonth: number;
}> {
  const emptyStats = {
    total: 0,
    byStage: { new: 0, contacted: 0, tour_scheduled: 0, proposal: 0, won: 0, lost: 0 },
    bySource: {},
    byPriority: { hot: 0, warm: 0, medium: 0, cold: 0 },
    thisMonth: 0,
    wonThisMonth: 0,
  };

  if (!isSupabaseAdminConfigured()) {
    return emptyStats;
  }

  let query = supabaseAdmin!
    .from('leads')
    .select('stage, source_id, priority, created_at, stage_changed_at')
    .eq('is_archived', false);

  if (branchId) {
    query = query.eq('branch_id', branchId);
  }

  const { data: leads, error } = await query;

  if (error) {
    console.error('Error fetching lead stats:', error);
    return emptyStats;
  }

  const byStage: Record<LeadStage, number> = { new: 0, contacted: 0, tour_scheduled: 0, proposal: 0, won: 0, lost: 0 };
  const bySource: Record<string, number> = {};
  const byPriority: Record<LeadPriority, number> = { hot: 0, warm: 0, medium: 0, cold: 0 };

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  let thisMonth = 0;
  let wonThisMonth = 0;

  leads?.forEach((lead) => {
    byStage[lead.stage as LeadStage]++;
    byPriority[lead.priority as LeadPriority]++;
    bySource[lead.source_id] = (bySource[lead.source_id] || 0) + 1;

    if (new Date(lead.created_at) >= startOfMonth) {
      thisMonth++;
    }
    if (lead.stage === 'won' && lead.stage_changed_at && new Date(lead.stage_changed_at) >= startOfMonth) {
      wonThisMonth++;
    }
  });

  return {
    total: leads?.length || 0,
    byStage,
    bySource,
    byPriority,
    thisMonth,
    wonThisMonth,
  };
}
