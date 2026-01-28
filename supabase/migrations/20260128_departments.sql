-- Departments Table
-- Organizational structure for employees

-- FACe Category enum for grouping functions
CREATE TYPE face_category AS ENUM (
  'executive',
  'growth',
  'support',
  'operations',
  'specialized'
);

CREATE TABLE IF NOT EXISTS departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  color VARCHAR(20) DEFAULT 'bg-gray-500', -- Tailwind color class for UI
  category face_category DEFAULT 'operations', -- FACe category for grouping
  accountable_person VARCHAR(100), -- Person accountable for this function (from FACe)
  display_order INT DEFAULT 0, -- Order within category for display
  manager_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add department_id to employees table
ALTER TABLE employees ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employees_department_id ON employees(department_id);
CREATE INDEX IF NOT EXISTS idx_departments_manager_id ON departments(manager_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_departments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS departments_updated_at ON departments;
CREATE TRIGGER departments_updated_at
  BEFORE UPDATE ON departments
  FOR EACH ROW
  EXECUTE FUNCTION update_departments_updated_at();

-- Insert C-Space FACe (Function Accountability Chart) - 14 Functions
-- Based on C-Space Strategy Reference Document V2.4
-- Accountable persons from FACe chart
INSERT INTO departments (name, description, color, category, accountable_person, display_order) VALUES
  -- Executive Leadership
  ('CEO', 'Chief Executive Officer - Overall company leadership and vision', 'bg-slate-800', 'executive', 'Dilmurod', 1),
  ('COO', 'Chief Operating Officer - Day-to-day operations management', 'bg-slate-700', 'executive', 'Zukhriddin', 2),
  ('CFO', 'Chief Financial Officer - Financial strategy and management', 'bg-green-600', 'executive', 'Dilmurod', 3),

  -- Business Growth Functions
  ('Business Development & Expansion', 'New partnerships, expansion strategy, growth initiatives', 'bg-blue-600', 'growth', 'Ubaydulloh', 1),
  ('Sales Management', 'Sales strategy, revenue generation, client acquisition', 'bg-yellow-500', 'growth', 'Ubaydulloh', 2),
  ('Marketing Management', 'Brand management, advertising, lead generation', 'bg-orange-500', 'growth', 'Ubaydulloh', 3),

  -- Support Functions
  ('HR', 'Human Resources - Recruitment, employee relations, development', 'bg-purple-500', 'support', 'Zukhriddin', 1),
  ('Legal Management', 'Legal affairs, contracts, compliance', 'bg-indigo-500', 'support', 'Nigina', 2),

  -- Operations Functions
  ('Experience Management', 'Branch Managers (BM), Night Shift (NS), Community Managers (CM) - Member experience and service quality', 'bg-pink-500', 'operations', 'Zukhriddin', 1),
  ('Internal Facility Management', 'Internal C-Space facilities, maintenance, operations', 'bg-cyan-500', 'operations', 'Mahmud', 2),
  ('External Facility Management', 'AXOs for Yandex and external client facility services', 'bg-teal-500', 'operations', 'Rahmatulloh', 3),

  -- Specialized Functions
  ('Technology Management', 'IT infrastructure, software, digital solutions', 'bg-violet-500', 'specialized', 'Ubaydulloh', 1),
  ('Construction & Launch Management', 'New location construction, facility launches', 'bg-amber-600', 'specialized', 'Zukhriddin', 2),
  ('VC', 'Venture Capital - Investment strategy and portfolio management', 'bg-emerald-600', 'specialized', 'Farrukh', 3)
ON CONFLICT (name) DO NOTHING;
