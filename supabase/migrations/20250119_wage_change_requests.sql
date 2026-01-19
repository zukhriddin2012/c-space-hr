-- Wage Change Requests Migration
-- Creates table for managing employee wage change requests with GM approval workflow

-- Create the wage_change_requests table
CREATE TABLE IF NOT EXISTS wage_change_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Employee & Wage Reference
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  wage_type TEXT NOT NULL,  -- 'primary' or 'additional'
  legal_entity_id TEXT,     -- For primary wages (references legal_entities)
  branch_id TEXT,           -- For additional wages (references branches)

  -- Change Details
  current_amount DECIMAL(15, 2) NOT NULL,
  proposed_amount DECIMAL(15, 2) NOT NULL,
  change_type TEXT NOT NULL,  -- 'increase' or 'decrease'
  reason TEXT NOT NULL,       -- HR must provide reason
  effective_date DATE NOT NULL,

  -- Workflow
  status TEXT NOT NULL DEFAULT 'pending',  -- 'pending', 'approved', 'rejected', 'cancelled'

  -- Tracking
  requested_by UUID NOT NULL REFERENCES employees(id),
  approved_by UUID REFERENCES employees(id),
  rejection_reason TEXT,
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  approved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_wage_change_requests_employee ON wage_change_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_wage_change_requests_status ON wage_change_requests(status);
CREATE INDEX IF NOT EXISTS idx_wage_change_requests_requested ON wage_change_requests(requested_by);
CREATE INDEX IF NOT EXISTS idx_wage_change_requests_created ON wage_change_requests(created_at DESC);

-- Add constraint for status values
ALTER TABLE wage_change_requests
ADD CONSTRAINT chk_wage_change_status
CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled'));

-- Add constraint for wage type values
ALTER TABLE wage_change_requests
ADD CONSTRAINT chk_wage_type
CHECK (wage_type IN ('primary', 'additional'));

-- Add constraint for change type values
ALTER TABLE wage_change_requests
ADD CONSTRAINT chk_change_type
CHECK (change_type IN ('increase', 'decrease'));

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_wage_change_requests_updated_at ON wage_change_requests;
CREATE TRIGGER update_wage_change_requests_updated_at
    BEFORE UPDATE ON wage_change_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE wage_change_requests IS 'Tracks employee wage change requests requiring GM approval';
COMMENT ON COLUMN wage_change_requests.employee_id IS 'The employee whose wage is being changed';
COMMENT ON COLUMN wage_change_requests.wage_type IS 'Type of wage: primary (bank) or additional (cash)';
COMMENT ON COLUMN wage_change_requests.legal_entity_id IS 'For primary wages: which legal entity pays this wage';
COMMENT ON COLUMN wage_change_requests.branch_id IS 'For additional wages: which branch pays this cash wage';
COMMENT ON COLUMN wage_change_requests.current_amount IS 'Current wage amount before change';
COMMENT ON COLUMN wage_change_requests.proposed_amount IS 'Proposed new wage amount';
COMMENT ON COLUMN wage_change_requests.change_type IS 'Whether this is an increase or decrease';
COMMENT ON COLUMN wage_change_requests.reason IS 'HR-provided reason for the wage change';
COMMENT ON COLUMN wage_change_requests.effective_date IS 'Date when the change should take effect';
COMMENT ON COLUMN wage_change_requests.status IS 'Current status: pending, approved, rejected, or cancelled';
COMMENT ON COLUMN wage_change_requests.requested_by IS 'HR manager who initiated the wage change request';
COMMENT ON COLUMN wage_change_requests.approved_by IS 'GM who approved/rejected the request';
COMMENT ON COLUMN wage_change_requests.rejection_reason IS 'Reason provided when rejecting the request';
