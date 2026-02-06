-- Add reception kiosk password support to branches
ALTER TABLE branches ADD COLUMN IF NOT EXISTS reception_password_hash TEXT DEFAULT NULL;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS reception_password_set_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
ALTER TABLE branches ADD COLUMN IF NOT EXISTS reception_password_set_by UUID DEFAULT NULL;
