-- ============================================================================
-- ASSIGN BRANCH TO USER
-- Run this to assign a branch to the current user (Zuxriddin Abduraxmonov)
-- ============================================================================

-- Update the employee record to assign them to labzak branch
-- Change 'labzak' to any other branch: yunusabad, elbek, chust, aero, beruniy, muqimiy, yandex
UPDATE employees
SET branch_id = 'labzak'
WHERE email = 'zuhriddin2012@gmail.com';

-- Verify the update
-- SELECT id, full_name, email, branch_id FROM employees WHERE email = 'zuhriddin2012@gmail.com';
