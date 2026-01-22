-- Migration: Add IP-First Attendance Verification
-- Date: 2025-01-23
-- Description: Adds office IP addresses to branches and verification tracking to attendance

-- ============================================
-- ADD OFFICE IPS TO BRANCHES
-- ============================================

-- Add office_ips column to branches table (array of IP addresses)
ALTER TABLE branches
ADD COLUMN IF NOT EXISTS office_ips TEXT[] DEFAULT '{}';

-- Comment for documentation
COMMENT ON COLUMN branches.office_ips IS 'Array of office IP addresses for automatic check-in verification';

-- ============================================
-- ADD VERIFICATION COLUMNS TO ATTENDANCE
-- ============================================

-- Add verification_type column (ip = verified via office WiFi, gps = verified via GPS location)
ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS verification_type VARCHAR(10) DEFAULT 'gps';

-- Add ip_address column to store the IP used during check-in
ALTER TABLE attendance
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(45);

-- Add index for filtering by verification type
CREATE INDEX IF NOT EXISTS idx_attendance_verification_type ON attendance(verification_type);

-- Comments for documentation
COMMENT ON COLUMN attendance.verification_type IS 'How the check-in was verified: ip (office WiFi) or gps (GPS location)';
COMMENT ON COLUMN attendance.ip_address IS 'IP address captured during check-in (for verification audit)';

-- ============================================
-- UPDATE VIEW FOR DASHBOARD (if exists)
-- ============================================

-- Drop and recreate the today_attendance view to include new columns
DROP VIEW IF EXISTS today_attendance;

CREATE OR REPLACE VIEW today_attendance AS
SELECT
  a.id,
  a.employee_id,
  e.full_name,
  e.position,
  a.date,
  a.check_in,
  a.check_out,
  a.check_in_branch_id,
  b_in.name as check_in_branch_name,
  a.check_out_branch_id,
  b_out.name as check_out_branch_name,
  a.shift_id,
  a.status,
  a.total_hours,
  a.verification_type,
  a.ip_address
FROM attendance a
JOIN employees e ON a.employee_id = e.id
LEFT JOIN branches b_in ON a.check_in_branch_id = b_in.id
LEFT JOIN branches b_out ON a.check_out_branch_id = b_out.id
WHERE a.date = CURRENT_DATE;
