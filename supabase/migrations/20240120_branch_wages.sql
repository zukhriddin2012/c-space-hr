-- Migration: Add employee_branch_wages table for Additional (cash) wages
-- Date: 2024-01-20
-- Description: Creates a table to store cash-based wages connected to branches,
--              complementing the existing employee_wages table for bank-based wages

-- ============================================
-- CREATE BRANCH WAGES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS employee_branch_wages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  branch_id TEXT NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  wage_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, branch_id)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_branch_wages_employee ON employee_branch_wages(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_branch_wages_branch ON employee_branch_wages(branch_id);
CREATE INDEX IF NOT EXISTS idx_employee_branch_wages_active ON employee_branch_wages(is_active);

-- Trigger to auto-update updated_at
CREATE OR REPLACE FUNCTION update_branch_wages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_branch_wages_updated_at ON employee_branch_wages;
CREATE TRIGGER trigger_update_branch_wages_updated_at
  BEFORE UPDATE ON employee_branch_wages
  FOR EACH ROW
  EXECUTE FUNCTION update_branch_wages_updated_at();

-- Grant permissions (if using RLS)
ALTER TABLE employee_branch_wages ENABLE ROW LEVEL SECURITY;

-- Allow service role full access
CREATE POLICY "Service role has full access to branch wages"
  ON employee_branch_wages
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE employee_branch_wages IS 'Stores Additional (cash) wages for employees, connected to branches';
COMMENT ON COLUMN employee_branch_wages.employee_id IS 'Reference to the employee receiving the wage';
COMMENT ON COLUMN employee_branch_wages.branch_id IS 'Reference to the branch paying the wage';
COMMENT ON COLUMN employee_branch_wages.wage_amount IS 'Monthly wage amount in UZS';
COMMENT ON COLUMN employee_branch_wages.notes IS 'Optional notes about this wage entry';
COMMENT ON COLUMN employee_branch_wages.is_active IS 'Soft delete flag - false means removed';
