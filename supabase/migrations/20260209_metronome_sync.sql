-- ============================================================================
-- Migration: Metronome Sync — PR2-045
-- Date: 2026-02-09
-- Description: Creates 5 tables for Metronome Sync leadership dashboard:
--   metronome_initiatives, metronome_action_items, metronome_decisions,
--   metronome_syncs, metronome_key_dates
-- Dependencies: None. Employee UUIDs stored as plain UUID (no FK to employees
--   table — enforced at API layer). This allows standalone migration.
-- ============================================================================


-- ============================================================================
-- 1. ENUMS
-- ============================================================================

-- 1a. Function tags (department/domain classification)
DO $$ BEGIN
  CREATE TYPE metronome_function_tag AS ENUM (
    'bd',            -- Business Development
    'construction',  -- Construction & Engineering
    'hr',            -- Human Resources
    'finance',       -- Finance & Accounting
    'legal',         -- Legal
    'strategy',      -- Strategy & Planning
    'service'        -- Service & Operations
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1b. Initiative priority levels
DO $$ BEGIN
  CREATE TYPE metronome_priority AS ENUM (
    'critical',      -- Needs immediate attention
    'high',          -- Important, time-sensitive
    'strategic',     -- Long-term, planned
    'resolved'       -- Completed / archived from active view
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1c. Action item status
DO $$ BEGIN
  CREATE TYPE metronome_action_status AS ENUM (
    'pending',       -- Not started
    'in_progress',   -- Underway
    'done',          -- Completed
    'blocked'        -- Waiting on dependency
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 1d. Decision status
DO $$ BEGIN
  CREATE TYPE metronome_decision_status AS ENUM (
    'open',          -- Needs decision
    'decided',       -- Decision made
    'deferred'       -- Postponed to future sync
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================================
-- 2. METRONOME_INITIATIVES
-- ============================================================================

CREATE TABLE IF NOT EXISTS metronome_initiatives (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core fields
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  function_tag metronome_function_tag NOT NULL,
  priority metronome_priority NOT NULL DEFAULT 'strategic',

  -- People (UUID arrays — platform pattern per D6)
  accountable_ids UUID[] NOT NULL DEFAULT '{}',

  -- Display labels (free text for flexibility)
  owner_label VARCHAR(255) DEFAULT NULL,     -- e.g. "Dilmurod + Zukhriddin"
  status_label VARCHAR(255) DEFAULT NULL,    -- e.g. "Awaiting specs"

  -- Deadlines
  deadline DATE DEFAULT NULL,
  deadline_label VARCHAR(100) DEFAULT NULL,  -- e.g. "By Wed 22 Jan"

  -- State
  is_archived BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_metronome_initiatives_function
  ON metronome_initiatives(function_tag)
  WHERE is_archived = FALSE;

CREATE INDEX IF NOT EXISTS idx_metronome_initiatives_priority
  ON metronome_initiatives(priority)
  WHERE is_archived = FALSE;

CREATE INDEX IF NOT EXISTS idx_metronome_initiatives_archived
  ON metronome_initiatives(is_archived);

CREATE INDEX IF NOT EXISTS idx_metronome_initiatives_created_by
  ON metronome_initiatives(created_by);

CREATE INDEX IF NOT EXISTS idx_metronome_initiatives_deadline
  ON metronome_initiatives(deadline)
  WHERE deadline IS NOT NULL AND is_archived = FALSE;

COMMENT ON TABLE metronome_initiatives IS 'Leadership initiatives tracked in Metronome Sync. Each initiative has action items and may have associated decisions.';
COMMENT ON COLUMN metronome_initiatives.accountable_ids IS 'Array of employee UUIDs responsible for this initiative. Uses UUID[] per platform convention (D6).';
COMMENT ON COLUMN metronome_initiatives.sort_order IS 'Manual sort order within priority group. 0 = default. Supports future drag-drop reordering.';


-- ============================================================================
-- 3. METRONOME_ACTION_ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS metronome_action_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Parent
  initiative_id UUID NOT NULL REFERENCES metronome_initiatives(id) ON DELETE CASCADE,

  -- Core fields
  title VARCHAR(500) NOT NULL,
  status metronome_action_status NOT NULL DEFAULT 'pending',

  -- Assignment
  assigned_to UUID DEFAULT NULL,

  -- Deadline
  deadline DATE DEFAULT NULL,

  -- Completion tracking
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

  -- Ordering
  sort_order INTEGER NOT NULL DEFAULT 0,

  -- Audit
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_metronome_actions_initiative
  ON metronome_action_items(initiative_id);

CREATE INDEX IF NOT EXISTS idx_metronome_actions_status
  ON metronome_action_items(status)
  WHERE status != 'done';

CREATE INDEX IF NOT EXISTS idx_metronome_actions_assigned
  ON metronome_action_items(assigned_to)
  WHERE assigned_to IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_metronome_actions_deadline
  ON metronome_action_items(deadline)
  WHERE deadline IS NOT NULL AND status != 'done';

COMMENT ON TABLE metronome_action_items IS 'Action items belonging to a metronome initiative. Toggle-able in dashboard and meeting mode.';
COMMENT ON COLUMN metronome_action_items.sort_order IS 'Display order within initiative. Supports reorder endpoint.';


-- ============================================================================
-- 4. METRONOME_DECISIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS metronome_decisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core
  question TEXT NOT NULL,

  -- Linkage (nullable — some decisions are cross-initiative)
  initiative_id UUID REFERENCES metronome_initiatives(id) ON DELETE SET NULL DEFAULT NULL,
  function_tag metronome_function_tag DEFAULT NULL,

  -- State
  status metronome_decision_status NOT NULL DEFAULT 'open',

  -- Resolution
  decision_text TEXT DEFAULT NULL,
  decided_by UUID DEFAULT NULL,
  decided_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,

  -- Deadline
  deadline DATE DEFAULT NULL,

  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_metronome_decisions_status
  ON metronome_decisions(status)
  WHERE status = 'open';

CREATE INDEX IF NOT EXISTS idx_metronome_decisions_initiative
  ON metronome_decisions(initiative_id)
  WHERE initiative_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_metronome_decisions_deadline
  ON metronome_decisions(deadline)
  WHERE deadline IS NOT NULL AND status = 'open';

COMMENT ON TABLE metronome_decisions IS 'Pending decisions that need resolution during sync meetings. Can be linked to an initiative or standalone.';
COMMENT ON COLUMN metronome_decisions.function_tag IS 'Set for cross-initiative or standalone decisions. Can differ from linked initiative function_tag.';


-- ============================================================================
-- 5. METRONOME_SYNCS
-- ============================================================================

CREATE TABLE IF NOT EXISTS metronome_syncs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Meeting info
  sync_date DATE NOT NULL DEFAULT CURRENT_DATE,
  title VARCHAR(255) DEFAULT NULL,
  notes TEXT DEFAULT NULL,

  -- Attendees (UUID array — platform pattern)
  attendee_ids UUID[] NOT NULL DEFAULT '{}',

  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  ended_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  duration_seconds INTEGER DEFAULT NULL,

  -- Next sync planning
  next_sync_date DATE DEFAULT NULL,
  next_sync_focus TEXT DEFAULT NULL,

  -- Focus areas (simplified storage per D1 — free text per person)
  focus_areas JSONB DEFAULT '[]',
  -- Format: [{"person": "Dilmurod", "items": ["VAT resolve", "Centris counter"]}]

  -- Meeting stats (captured on end)
  items_discussed INTEGER DEFAULT 0,
  decisions_made INTEGER DEFAULT 0,
  action_items_completed INTEGER DEFAULT 0,

  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_metronome_syncs_date
  ON metronome_syncs(sync_date DESC);

COMMENT ON TABLE metronome_syncs IS 'Records of sync meetings. Created when meeting mode ends. Contains timing, attendees, notes, and next sync planning.';
COMMENT ON COLUMN metronome_syncs.focus_areas IS 'This week focus per person. JSONB array: [{"person":"Name","items":["task1","task2"]}]. Simplified storage per D1.';
COMMENT ON COLUMN metronome_syncs.duration_seconds IS 'Computed from started_at/ended_at or set by client timer.';


-- ============================================================================
-- 6. METRONOME_KEY_DATES
-- ============================================================================

CREATE TABLE IF NOT EXISTS metronome_key_dates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Core
  date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  emoji VARCHAR(10) DEFAULT NULL,

  -- Category (for calendar pill coloring)
  category VARCHAR(20) NOT NULL DEFAULT 'event',
  -- Values: 'critical', 'high', 'meeting', 'strategic', 'event', 'holiday'

  -- Linkage (nullable)
  initiative_id UUID REFERENCES metronome_initiatives(id) ON DELETE SET NULL DEFAULT NULL,

  -- Recurrence (future use)
  is_recurring BOOLEAN NOT NULL DEFAULT FALSE,

  -- Audit
  created_by UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_metronome_key_dates_date
  ON metronome_key_dates(date);

COMMENT ON TABLE metronome_key_dates IS 'Key dates shown on the Metronome calendar. Can be linked to initiatives or standalone events.';
COMMENT ON COLUMN metronome_key_dates.category IS 'Calendar pill color category. Maps to UI: critical=red, high=orange, meeting=purple, strategic=yellow, event=blue, holiday=gold.';


-- ============================================================================
-- 7. UPDATED_AT TRIGGERS
-- ============================================================================

-- Auto-update updated_at on row modification
CREATE OR REPLACE FUNCTION metronome_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to tables with updated_at column
DO $$ BEGIN
  CREATE TRIGGER trg_metronome_initiatives_updated
    BEFORE UPDATE ON metronome_initiatives
    FOR EACH ROW EXECUTE FUNCTION metronome_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_metronome_action_items_updated
    BEFORE UPDATE ON metronome_action_items
    FOR EACH ROW EXECUTE FUNCTION metronome_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_metronome_decisions_updated
    BEFORE UPDATE ON metronome_decisions
    FOR EACH ROW EXECUTE FUNCTION metronome_set_updated_at();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


-- ============================================================================
-- 8. ROW-LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE metronome_initiatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE metronome_action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE metronome_decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE metronome_syncs ENABLE ROW LEVEL SECURITY;
ALTER TABLE metronome_key_dates ENABLE ROW LEVEL SECURITY;

-- NOTE: C-Space Niya uses supabaseAdmin (service role key) which bypasses RLS.
-- RLS policies below are defense-in-depth for any direct DB access.
-- The actual permission enforcement happens at the API layer via withAuth().

-- Initiatives: leadership roles can read, general_manager can write all, others write own
CREATE POLICY metronome_initiatives_read ON metronome_initiatives
  FOR SELECT USING (TRUE);
  -- API layer enforces METRONOME_VIEW permission

CREATE POLICY metronome_initiatives_insert ON metronome_initiatives
  FOR INSERT WITH CHECK (TRUE);
  -- API layer enforces METRONOME_CREATE permission

CREATE POLICY metronome_initiatives_update ON metronome_initiatives
  FOR UPDATE USING (TRUE);
  -- API layer enforces METRONOME_EDIT_OWN or METRONOME_EDIT_ALL

-- Action items: same as parent initiative
CREATE POLICY metronome_action_items_read ON metronome_action_items
  FOR SELECT USING (TRUE);

CREATE POLICY metronome_action_items_write ON metronome_action_items
  FOR ALL USING (TRUE);

-- Decisions: leadership read, general_manager/ceo write
CREATE POLICY metronome_decisions_read ON metronome_decisions
  FOR SELECT USING (TRUE);

CREATE POLICY metronome_decisions_write ON metronome_decisions
  FOR ALL USING (TRUE);

-- Syncs: leadership read, general_manager/ceo write
CREATE POLICY metronome_syncs_read ON metronome_syncs
  FOR SELECT USING (TRUE);

CREATE POLICY metronome_syncs_write ON metronome_syncs
  FOR ALL USING (TRUE);

-- Key dates: all read, MANAGE_DATES write
CREATE POLICY metronome_key_dates_read ON metronome_key_dates
  FOR SELECT USING (TRUE);

CREATE POLICY metronome_key_dates_write ON metronome_key_dates
  FOR ALL USING (TRUE);


-- ============================================================================
-- 9. ROLLBACK SCRIPT (run separately if needed)
-- ============================================================================
-- DROP TABLE IF EXISTS metronome_key_dates CASCADE;
-- DROP TABLE IF EXISTS metronome_syncs CASCADE;
-- DROP TABLE IF EXISTS metronome_decisions CASCADE;
-- DROP TABLE IF EXISTS metronome_action_items CASCADE;
-- DROP TABLE IF EXISTS metronome_initiatives CASCADE;
-- DROP TYPE IF EXISTS metronome_function_tag;
-- DROP TYPE IF EXISTS metronome_priority;
-- DROP TYPE IF EXISTS metronome_action_status;
-- DROP TYPE IF EXISTS metronome_decision_status;
-- DROP FUNCTION IF EXISTS metronome_set_updated_at();
