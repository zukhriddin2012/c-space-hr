-- Add manager_id to employees table for org chart hierarchy
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES employees(id) ON DELETE SET NULL;

-- Create index for faster hierarchy queries
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);

-- Add comment for documentation
COMMENT ON COLUMN employees.manager_id IS 'References the employee''s direct manager for org chart hierarchy';
