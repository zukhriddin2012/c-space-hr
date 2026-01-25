-- Growth Team Feature Migration
-- Adds Growth Team tracking for strategic projects and leadership alignment

-- 1. Add is_growth_team column to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS is_growth_team BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_employees_growth_team ON employees(is_growth_team) WHERE is_growth_team = TRUE;

-- 2. Drop existing tables if they exist (to handle partial migrations)
DROP TABLE IF EXISTS growth_projects CASCADE;
DROP TABLE IF EXISTS growth_key_dates CASCADE;
DROP TABLE IF EXISTS growth_personal_focus CASCADE;
DROP TABLE IF EXISTS growth_syncs CASCADE;

-- 3. Growth Syncs table FIRST (since other tables reference it)
CREATE TABLE growth_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Sync info
  title TEXT NOT NULL,  -- e.g., "C-Space Leadership Alignment"
  sync_date DATE NOT NULL,  -- Date of this sync

  -- Next sync info
  next_sync_date DATE,
  next_sync_time TEXT,
  next_sync_focus TEXT[],  -- Focus areas for next sync

  -- Summary
  resolved TEXT[],  -- Items resolved in this sync
  summary JSONB,  -- Summary data (priority counts, etc.)
  decisions JSONB,  -- Decisions made in this sync

  -- Raw data
  raw_import JSONB,  -- Store original import for reference

  -- Tracking
  imported_by UUID REFERENCES employees(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_growth_syncs_date ON growth_syncs(sync_date DESC);

-- 4. Growth Projects table (from Metronome Sync)
CREATE TABLE growth_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Project info
  title TEXT NOT NULL,
  tag TEXT,  -- e.g., 'PRODUCT', 'MARKETING', 'OPERATIONS'
  priority TEXT CHECK (priority IN ('critical', 'high', 'strategic', 'normal')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'blocked', 'completed', 'cancelled')),

  -- Dates
  deadline TEXT,  -- Flexible text format (e.g., "Jan 20", "End of Q1")

  -- People
  owner TEXT,  -- Person responsible
  accountable TEXT[],  -- Array of people accountable

  -- Details
  description TEXT,
  details JSONB,  -- Flexible JSON for additional structured data
  actions JSONB,  -- Action items as JSON array
  alert TEXT,  -- Any alert/warning text

  -- Tracking
  sync_id UUID REFERENCES growth_syncs(id),  -- Links to growth_syncs for import tracking
  source_key TEXT,  -- Original key from Metronome Sync JSON

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_growth_projects_priority ON growth_projects(priority);
CREATE INDEX idx_growth_projects_status ON growth_projects(status);
CREATE INDEX idx_growth_projects_sync ON growth_projects(sync_id);

-- 5. Growth Key Dates (important calendar dates)
CREATE TABLE growth_key_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Date info
  date DATE NOT NULL,
  label TEXT NOT NULL,  -- Short label
  events TEXT NOT NULL,  -- Description of events

  -- Flags
  highlight BOOLEAN DEFAULT FALSE,  -- Should be highlighted
  critical BOOLEAN DEFAULT FALSE,  -- Is critical/important

  -- Tracking
  sync_id UUID REFERENCES growth_syncs(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_growth_key_dates_date ON growth_key_dates(date);

-- 6. Growth Personal Focus (per-person focus items)
CREATE TABLE growth_personal_focus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Person info
  person TEXT NOT NULL,  -- Name
  role TEXT,  -- Their role
  emoji TEXT,  -- Display emoji

  -- Focus items
  items TEXT[],  -- Array of focus items

  -- Tracking
  sync_date DATE,  -- When this was synced
  sync_id UUID REFERENCES growth_syncs(id),

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_growth_personal_focus_person ON growth_personal_focus(person);

-- 7. Trigger for updated_at on growth_projects
CREATE OR REPLACE FUNCTION update_growth_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_growth_projects_updated_at
  BEFORE UPDATE ON growth_projects
  FOR EACH ROW
  EXECUTE FUNCTION update_growth_projects_updated_at();

-- 8. Comments
COMMENT ON TABLE growth_projects IS 'Strategic projects tracked by the Growth Team';
COMMENT ON TABLE growth_key_dates IS 'Important calendar dates for Growth Team';
COMMENT ON TABLE growth_personal_focus IS 'Per-person focus items from Metronome Sync';
COMMENT ON TABLE growth_syncs IS 'Leadership alignment sync sessions (Metronome Sync)';
COMMENT ON COLUMN employees.is_growth_team IS 'Whether employee is part of the Growth Team with access to strategic projects';
