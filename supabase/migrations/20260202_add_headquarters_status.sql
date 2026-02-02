-- Add 'headquarters' to operational_status check constraint
-- Drop existing constraint and recreate with new value

ALTER TABLE branches
DROP CONSTRAINT IF EXISTS branches_operational_status_check;

ALTER TABLE branches
ADD CONSTRAINT branches_operational_status_check
CHECK (operational_status IN ('under_construction', 'operational', 'rented', 'facility_management', 'headquarters'));
