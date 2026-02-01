-- Migration: Shift Planning Module - Database Schema
-- Version: 1.0
-- Date: 2026-02-03
-- Description: Creates all tables for shift planning: schedules, assignments,
--              branch requirements, time off requests, and employee availability.
--              Also adds shift-related columns to employees table.

-- ============================================
-- 1. SHIFT SCHEDULES TABLE
-- Weekly schedule container (one per week)
-- ============================================
CREATE TABLE IF NOT EXISTS shift_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  week_start_date DATE NOT NULL UNIQUE,       -- Monday of the week
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published', 'locked')),
  published_at TIMESTAMP WITH TIME ZONE,
  published_by UUID REFERENCES employees(id),
  notes TEXT,                                  -- Week-level notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for shift_schedules
CREATE INDEX IF NOT EXISTS idx_shift_schedules_week ON shift_schedules(week_start_date DESC);
CREATE INDEX IF NOT EXISTS idx_shift_schedules_status ON shift_schedules(status);

-- ============================================
-- 2. SHIFT ASSIGNMENTS TABLE
-- Individual shift assignments (employee to branch/date/shift)
-- ============================================
CREATE TABLE IF NOT EXISTS shift_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  schedule_id UUID NOT NULL REFERENCES shift_schedules(id) ON DELETE CASCADE,
  branch_id VARCHAR NOT NULL REFERENCES branches(id),
  date DATE NOT NULL,
  shift_type VARCHAR(10) NOT NULL CHECK (shift_type IN ('day', 'night')),
  employee_id UUID NOT NULL REFERENCES employees(id),
  role VARCHAR(30) DEFAULT 'community_manager',  -- community_manager, branch_manager
  confirmed_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent double-booking same person same day same shift
  UNIQUE (employee_id, date, shift_type)
);

-- Indexes for shift_assignments (optimized for grid queries)
CREATE INDEX IF NOT EXISTS idx_shift_assignments_schedule ON shift_assignments(schedule_id);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_branch_date ON shift_assignments(branch_id, date);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_employee_date ON shift_assignments(employee_id, date);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_grid ON shift_assignments(schedule_id, branch_id, date, shift_type);
CREATE INDEX IF NOT EXISTS idx_shift_assignments_date ON shift_assignments(date);

-- ============================================
-- 3. BRANCH SHIFT REQUIREMENTS TABLE
-- Per-branch staffing requirements
-- ============================================
CREATE TABLE IF NOT EXISTS branch_shift_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  branch_id VARCHAR NOT NULL REFERENCES branches(id),
  shift_type VARCHAR(10) NOT NULL CHECK (shift_type IN ('day', 'night')),
  min_staff INTEGER NOT NULL DEFAULT 1,
  max_staff INTEGER DEFAULT 3,
  has_shift BOOLEAN NOT NULL DEFAULT TRUE,     -- Whether branch has this shift type
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (branch_id, shift_type)
);

-- Index for branch requirements
CREATE INDEX IF NOT EXISTS idx_branch_requirements_branch ON branch_shift_requirements(branch_id);

-- ============================================
-- 4. TIME OFF REQUESTS TABLE
-- Employee time off requests with smart auto-approval
-- ============================================
CREATE TABLE IF NOT EXISTS time_off_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER GENERATED ALWAYS AS (end_date - start_date + 1) STORED,
  reason TEXT,                                  -- Optional for 1-2 days
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  auto_approved BOOLEAN NOT NULL DEFAULT FALSE, -- True if 1-2 days
  reviewed_by UUID REFERENCES employees(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  CHECK (end_date >= start_date)
);

-- Indexes for time_off_requests
CREATE INDEX IF NOT EXISTS idx_time_off_employee ON time_off_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_time_off_dates ON time_off_requests(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_time_off_status ON time_off_requests(status);

-- ============================================
-- 5. EMPLOYEE AVAILABILITY TABLE
-- Recurring weekly availability patterns
-- ============================================
CREATE TABLE IF NOT EXISTS employee_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id),
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Sunday, 6=Saturday
  available_day BOOLEAN NOT NULL DEFAULT TRUE,
  available_night BOOLEAN NOT NULL DEFAULT TRUE,
  effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE (employee_id, day_of_week, effective_from)
);

-- Index for employee availability
CREATE INDEX IF NOT EXISTS idx_availability_employee ON employee_availability(employee_id);
CREATE INDEX IF NOT EXISTS idx_availability_effective ON employee_availability(effective_from);

-- ============================================
-- 6. ALTER EMPLOYEES TABLE
-- Add shift-related columns
-- ============================================
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS can_work_night BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS is_floater BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS primary_branch_id VARCHAR REFERENCES branches(id),
ADD COLUMN IF NOT EXISTS max_hours_per_week INTEGER DEFAULT 48;

-- ============================================
-- 7. AUTO-APPROVAL TRIGGER FOR TIME OFF
-- 1-2 days = auto-approved, 3+ days = pending
-- ============================================
CREATE OR REPLACE FUNCTION auto_approve_short_time_off()
RETURNS TRIGGER AS $$
BEGIN
  -- Auto-approve if 1-2 days
  IF (NEW.end_date - NEW.start_date + 1) <= 2 THEN
    NEW.status := 'approved';
    NEW.auto_approved := TRUE;
    NEW.reviewed_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_approve_time_off ON time_off_requests;
CREATE TRIGGER trigger_auto_approve_time_off
  BEFORE INSERT ON time_off_requests
  FOR EACH ROW
  EXECUTE FUNCTION auto_approve_short_time_off();

-- ============================================
-- 8. UPDATED_AT TRIGGERS
-- ============================================
CREATE OR REPLACE FUNCTION trigger_update_shift_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_shift_schedules_timestamp
  BEFORE UPDATE ON shift_schedules
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_shift_timestamp();

CREATE TRIGGER update_shift_assignments_timestamp
  BEFORE UPDATE ON shift_assignments
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_shift_timestamp();

CREATE TRIGGER update_branch_requirements_timestamp
  BEFORE UPDATE ON branch_shift_requirements
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_shift_timestamp();

CREATE TRIGGER update_employee_availability_timestamp
  BEFORE UPDATE ON employee_availability
  FOR EACH ROW
  EXECUTE FUNCTION trigger_update_shift_timestamp();

-- ============================================
-- 9. ROW LEVEL SECURITY
-- ============================================
ALTER TABLE shift_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE shift_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE branch_shift_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_availability ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all for authenticated users (permissions handled in app)
CREATE POLICY "Enable all for authenticated users" ON shift_schedules
  FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON shift_assignments
  FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON branch_shift_requirements
  FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON time_off_requests
  FOR ALL USING (true);

CREATE POLICY "Enable all for authenticated users" ON employee_availability
  FOR ALL USING (true);

-- ============================================
-- 10. GRANT PERMISSIONS
-- ============================================
GRANT ALL ON shift_schedules TO authenticated;
GRANT ALL ON shift_assignments TO authenticated;
GRANT ALL ON branch_shift_requirements TO authenticated;
GRANT ALL ON time_off_requests TO authenticated;
GRANT ALL ON employee_availability TO authenticated;

-- ============================================
-- 11. SEED DATA: Default Branch Shift Requirements
-- All branches get default requirements (day: min 2, night: min 1)
-- ============================================
INSERT INTO branch_shift_requirements (branch_id, shift_type, min_staff, max_staff, has_shift)
SELECT
  b.id,
  shift_types.shift_type,
  CASE WHEN shift_types.shift_type = 'day' THEN 2 ELSE 1 END as min_staff,
  CASE WHEN shift_types.shift_type = 'day' THEN 3 ELSE 2 END as max_staff,
  TRUE as has_shift
FROM branches b
CROSS JOIN (VALUES ('day'), ('night')) as shift_types(shift_type)
ON CONFLICT (branch_id, shift_type) DO NOTHING;

-- ============================================
-- 12. COMMENTS FOR DOCUMENTATION
-- ============================================
COMMENT ON TABLE shift_schedules IS 'Weekly schedule containers with draft/published/locked workflow';
COMMENT ON TABLE shift_assignments IS 'Individual employee-to-shift assignments';
COMMENT ON TABLE branch_shift_requirements IS 'Configurable staffing requirements per branch per shift type';
COMMENT ON TABLE time_off_requests IS 'Employee time off requests with auto-approval for 1-2 days';
COMMENT ON TABLE employee_availability IS 'Recurring weekly availability patterns per employee';

COMMENT ON COLUMN shift_schedules.week_start_date IS 'Monday of the week (unique per week)';
COMMENT ON COLUMN shift_schedules.status IS 'draft=editing, published=visible to employees, locked=read-only';
COMMENT ON COLUMN shift_assignments.shift_type IS 'day=09:00-18:00, night=18:00-09:00 (overnight)';
COMMENT ON COLUMN shift_assignments.confirmed_at IS 'Timestamp when employee confirmed the shift';
COMMENT ON COLUMN time_off_requests.auto_approved IS 'True if 1-2 days (auto-approved), false if 3+ days (needs HR)';
COMMENT ON COLUMN employee_availability.day_of_week IS '0=Sunday, 1=Monday, ..., 6=Saturday';
