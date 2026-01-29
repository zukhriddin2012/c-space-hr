-- ============================================================================
-- PAYSLIPS TABLE WITH HISTORICAL SALARY TRACKING
-- This migration creates the payslips table if it doesn't exist
-- and adds columns for historical salary tracking
-- ============================================================================

-- Create the payslips table if it doesn't exist
CREATE TABLE IF NOT EXISTS payslips (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  month INTEGER NOT NULL,
  gross_salary DECIMAL(15, 2) DEFAULT 0,
  net_salary DECIMAL(15, 2) DEFAULT 0,
  deductions DECIMAL(15, 2) DEFAULT 0,
  bonuses DECIMAL(15, 2) DEFAULT 0,
  working_days INTEGER DEFAULT 0,
  worked_days INTEGER DEFAULT 0,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'approved', 'paid')),
  -- Historical salary tracking columns
  advance_paid DECIMAL(15, 2) DEFAULT 0,
  wage_paid DECIMAL(15, 2) DEFAULT 0,
  notes TEXT,
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, year, month)
);

-- Add columns if table already exists (for existing installations)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'payslips' AND column_name = 'advance_paid') THEN
    ALTER TABLE payslips ADD COLUMN advance_paid DECIMAL(15, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'payslips' AND column_name = 'wage_paid') THEN
    ALTER TABLE payslips ADD COLUMN wage_paid DECIMAL(15, 2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                 WHERE table_name = 'payslips' AND column_name = 'notes') THEN
    ALTER TABLE payslips ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_payslips_year_month ON payslips(year, month);
CREATE INDEX IF NOT EXISTS idx_payslips_employee_year ON payslips(employee_id, year);
CREATE INDEX IF NOT EXISTS idx_payslips_status ON payslips(status);

-- Add comments for documentation
COMMENT ON COLUMN payslips.advance_paid IS 'Advance payment (Avans) for the month';
COMMENT ON COLUMN payslips.wage_paid IS 'Main salary payment (Oylik) for the month';
COMMENT ON COLUMN payslips.notes IS 'Additional notes or import source info';

-- Create updated_at trigger if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to payslips table
DROP TRIGGER IF EXISTS update_payslips_updated_at ON payslips;
CREATE TRIGGER update_payslips_updated_at
    BEFORE UPDATE ON payslips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
