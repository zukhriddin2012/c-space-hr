-- PR2-053 AT-21: Add recurrence columns to metronome_key_dates
-- Non-breaking: existing rows get NULL defaults (nullable columns)

-- Step 1: Create enum type for recurrence rules
DO $$ BEGIN
  CREATE TYPE metronome_recurrence_rule AS ENUM ('weekly', 'biweekly', 'monthly');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Add recurrence_rule column (nullable)
ALTER TABLE metronome_key_dates
  ADD COLUMN IF NOT EXISTS recurrence_rule metronome_recurrence_rule DEFAULT NULL;

-- Step 3: Add recurrence_end column (nullable)
ALTER TABLE metronome_key_dates
  ADD COLUMN IF NOT EXISTS recurrence_end DATE DEFAULT NULL;

-- Step 4: Add CHECK constraint: recurrence_end must be after date when both are set
ALTER TABLE metronome_key_dates
  ADD CONSTRAINT chk_recurrence_end_after_date
  CHECK (recurrence_end IS NULL OR recurrence_end > date);

-- Step 5: Add CHECK constraint: recurrence_rule and is_recurring must be consistent
-- If recurrence_rule is set, is_recurring should be true
ALTER TABLE metronome_key_dates
  ADD CONSTRAINT chk_recurrence_rule_requires_recurring
  CHECK (recurrence_rule IS NULL OR is_recurring = true);

-- Step 6: Index for recurring events
CREATE INDEX IF NOT EXISTS idx_metronome_key_dates_recurring
  ON metronome_key_dates (date, recurrence_rule)
  WHERE recurrence_rule IS NOT NULL;

-- Step 7: Update existing is_recurring=true rows to have a default rule
UPDATE metronome_key_dates
  SET recurrence_rule = 'monthly'
  WHERE is_recurring = true AND recurrence_rule IS NULL;

-- Rollback:
-- UPDATE metronome_key_dates SET recurrence_rule = NULL WHERE recurrence_rule IS NOT NULL;
-- ALTER TABLE metronome_key_dates DROP CONSTRAINT IF EXISTS chk_recurrence_rule_requires_recurring;
-- ALTER TABLE metronome_key_dates DROP CONSTRAINT IF EXISTS chk_recurrence_end_after_date;
-- DROP INDEX IF EXISTS idx_metronome_key_dates_recurring;
-- ALTER TABLE metronome_key_dates DROP COLUMN IF EXISTS recurrence_end;
-- ALTER TABLE metronome_key_dates DROP COLUMN IF EXISTS recurrence_rule;
-- DROP TYPE IF EXISTS metronome_recurrence_rule;
