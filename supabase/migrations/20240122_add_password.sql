-- Add password column to employees table for authentication
-- Passwords are stored as plain text for demo purposes only
-- In production, use proper password hashing (bcrypt, argon2, etc.)

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add index for email lookup during login
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

COMMENT ON COLUMN employees.password IS 'User password for authentication (demo only - use hashing in production)';
