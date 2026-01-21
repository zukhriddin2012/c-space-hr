-- Recruitment Enhancements: Comments, Events, and Candidate updates

-- =============================================
-- 1. Candidate Comments Table
-- =============================================
CREATE TABLE IF NOT EXISTS candidate_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES employees(id),
  content TEXT NOT NULL,
  stage_tag TEXT, -- Which stage this comment relates to (screening, interview_1, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for comments
CREATE INDEX IF NOT EXISTS idx_candidate_comments_candidate ON candidate_comments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_comments_created ON candidate_comments(created_at DESC);

-- =============================================
-- 2. Candidate Events Table (Interviews, Meetings, Deadlines)
-- =============================================
CREATE TABLE IF NOT EXISTS candidate_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  candidate_id UUID NOT NULL REFERENCES candidates(id) ON DELETE CASCADE,

  title TEXT NOT NULL,
  event_type TEXT NOT NULL DEFAULT 'interview', -- 'interview', 'meeting', 'deadline', 'review'

  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE, -- NULL if not completed

  with_user_id UUID REFERENCES employees(id), -- Who is conducting the interview/meeting
  location TEXT, -- Room, link, etc.
  notes TEXT,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for events
CREATE INDEX IF NOT EXISTS idx_candidate_events_candidate ON candidate_events(candidate_id);
CREATE INDEX IF NOT EXISTS idx_candidate_events_scheduled ON candidate_events(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_candidate_events_type ON candidate_events(event_type);

-- Constraint for event types
ALTER TABLE candidate_events
ADD CONSTRAINT chk_event_type
CHECK (event_type IN ('interview', 'meeting', 'deadline', 'review', 'signing', 'other'));

-- =============================================
-- 3. Update Candidates Table
-- =============================================

-- Add next_event_at for quick deadline display on board
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS next_event_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS next_event_title TEXT;

-- Add probation tracking fields
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS term_sheet_signed BOOLEAN DEFAULT FALSE;
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS probation_account_created BOOLEAN DEFAULT FALSE;

-- Add comment count for quick display (denormalized for performance)
ALTER TABLE candidates ADD COLUMN IF NOT EXISTS comment_count INTEGER DEFAULT 0;

-- Index for deadline queries
CREATE INDEX IF NOT EXISTS idx_candidates_next_event ON candidates(next_event_at) WHERE next_event_at IS NOT NULL;

-- =============================================
-- 4. Trigger to update next_event on candidates
-- =============================================
CREATE OR REPLACE FUNCTION update_candidate_next_event()
RETURNS TRIGGER AS $$
BEGIN
  -- Update the candidate's next_event fields
  UPDATE candidates
  SET
    next_event_at = (
      SELECT MIN(scheduled_at)
      FROM candidate_events
      WHERE candidate_id = COALESCE(NEW.candidate_id, OLD.candidate_id)
        AND completed_at IS NULL
        AND scheduled_at > NOW()
    ),
    next_event_title = (
      SELECT title
      FROM candidate_events
      WHERE candidate_id = COALESCE(NEW.candidate_id, OLD.candidate_id)
        AND completed_at IS NULL
        AND scheduled_at > NOW()
      ORDER BY scheduled_at ASC
      LIMIT 1
    )
  WHERE id = COALESCE(NEW.candidate_id, OLD.candidate_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger on events insert/update/delete
DROP TRIGGER IF EXISTS trigger_update_candidate_next_event ON candidate_events;
CREATE TRIGGER trigger_update_candidate_next_event
AFTER INSERT OR UPDATE OR DELETE ON candidate_events
FOR EACH ROW
EXECUTE FUNCTION update_candidate_next_event();

-- =============================================
-- 5. Trigger to update comment count
-- =============================================
CREATE OR REPLACE FUNCTION update_candidate_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE candidates
  SET comment_count = (
    SELECT COUNT(*)
    FROM candidate_comments
    WHERE candidate_id = COALESCE(NEW.candidate_id, OLD.candidate_id)
  )
  WHERE id = COALESCE(NEW.candidate_id, OLD.candidate_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger on comments insert/delete
DROP TRIGGER IF EXISTS trigger_update_candidate_comment_count ON candidate_comments;
CREATE TRIGGER trigger_update_candidate_comment_count
AFTER INSERT OR DELETE ON candidate_comments
FOR EACH ROW
EXECUTE FUNCTION update_candidate_comment_count();

-- =============================================
-- 6. Update triggers for updated_at
-- =============================================
CREATE TRIGGER update_candidate_comments_updated_at
    BEFORE UPDATE ON candidate_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_candidate_events_updated_at
    BEFORE UPDATE ON candidate_events
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
