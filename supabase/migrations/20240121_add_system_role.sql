-- Add system_role column to employees table for role-based access control
-- This determines the user's access level in the HR system

-- Add the system_role column with default value 'employee'
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS system_role TEXT DEFAULT 'employee';

-- Create an index for faster role-based queries
CREATE INDEX IF NOT EXISTS idx_employees_system_role ON employees(system_role);

-- Add a check constraint to ensure valid roles
-- Valid roles: general_manager, ceo, hr, branch_manager, recruiter, employee
ALTER TABLE employees
ADD CONSTRAINT valid_system_role
CHECK (system_role IN ('general_manager', 'ceo', 'hr', 'branch_manager', 'recruiter', 'employee'));

-- Comment on the column
COMMENT ON COLUMN employees.system_role IS 'User role for access control: general_manager, ceo, hr, branch_manager, recruiter, employee';
