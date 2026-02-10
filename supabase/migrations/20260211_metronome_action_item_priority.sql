-- PR2-053 AT-15: Add priority column to metronome_action_items
-- Non-breaking: existing rows get 'normal' default

-- Step 1: Create enum type for action item priority
DO $$ BEGIN
  CREATE TYPE metronome_action_priority AS ENUM ('urgent', 'important', 'normal');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Step 2: Add priority column with default
ALTER TABLE metronome_action_items
  ADD COLUMN IF NOT EXISTS priority metronome_action_priority NOT NULL DEFAULT 'normal';

-- Step 3: Add partial index for non-normal priorities (query optimization)
CREATE INDEX IF NOT EXISTS idx_metronome_actions_priority
  ON metronome_action_items (priority)
  WHERE priority != 'normal';

-- Step 4: Composite index for initiative + priority sorting
CREATE INDEX IF NOT EXISTS idx_metronome_actions_initiative_priority
  ON metronome_action_items (initiative_id, priority, sort_order)
  WHERE priority != 'normal';

-- Rollback:
-- DROP INDEX IF EXISTS idx_metronome_actions_initiative_priority;
-- DROP INDEX IF EXISTS idx_metronome_actions_priority;
-- ALTER TABLE metronome_action_items DROP COLUMN IF EXISTS priority;
-- DROP TYPE IF EXISTS metronome_action_priority;
