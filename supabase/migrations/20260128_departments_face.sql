-- Add FACe fields to existing departments table
-- This migration adds category, accountable_person, and display_order columns

-- Create the face_category enum type if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'face_category') THEN
        CREATE TYPE face_category AS ENUM (
          'executive',
          'growth',
          'support',
          'operations',
          'specialized'
        );
    END IF;
END $$;

-- Add new columns to departments table
ALTER TABLE departments
ADD COLUMN IF NOT EXISTS category face_category DEFAULT 'operations',
ADD COLUMN IF NOT EXISTS accountable_person VARCHAR(100),
ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

-- Delete existing generic departments to replace with FACe structure
DELETE FROM departments WHERE name IN (
  'Operations', 'Human Resources', 'Finance', 'Marketing',
  'IT & Development', 'Administration', 'Legal', 'Sales'
);

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
ON CONFLICT (name) DO UPDATE SET
  description = EXCLUDED.description,
  color = EXCLUDED.color,
  category = EXCLUDED.category,
  accountable_person = EXCLUDED.accountable_person,
  display_order = EXCLUDED.display_order;
