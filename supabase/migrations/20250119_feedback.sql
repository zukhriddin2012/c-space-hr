-- Feedback Submissions Migration
-- Creates table for employee feedback with optional anonymity

-- Create the feedback_submissions table
CREATE TABLE IF NOT EXISTS feedback_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Submitter info
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,

  -- Feedback content
  category TEXT NOT NULL,
  feedback_text TEXT NOT NULL,
  rating INTEGER,  -- Optional 1-5 rating

  -- Status tracking
  status TEXT NOT NULL DEFAULT 'submitted',

  -- Review tracking
  read_by UUID REFERENCES employees(id),
  read_at TIMESTAMP WITH TIME ZONE,
  acknowledged_by UUID REFERENCES employees(id),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  response_note TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_feedback_employee ON feedback_submissions(employee_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback_submissions(status);
CREATE INDEX IF NOT EXISTS idx_feedback_created ON feedback_submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feedback_anonymous ON feedback_submissions(is_anonymous);

-- Add constraint for status values
ALTER TABLE feedback_submissions
ADD CONSTRAINT chk_feedback_status
CHECK (status IN ('submitted', 'read', 'acknowledged'));

-- Add constraint for category values
ALTER TABLE feedback_submissions
ADD CONSTRAINT chk_feedback_category
CHECK (category IN ('work_environment', 'management', 'career', 'compensation', 'suggestion', 'other'));

-- Add constraint for rating values (1-5)
ALTER TABLE feedback_submissions
ADD CONSTRAINT chk_feedback_rating
CHECK (rating IS NULL OR (rating >= 1 AND rating <= 5));

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_feedback_submissions_updated_at ON feedback_submissions;
CREATE TRIGGER update_feedback_submissions_updated_at
    BEFORE UPDATE ON feedback_submissions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE feedback_submissions IS 'Stores employee feedback submissions with optional anonymity';
COMMENT ON COLUMN feedback_submissions.employee_id IS 'The employee who submitted the feedback';
COMMENT ON COLUMN feedback_submissions.is_anonymous IS 'Whether the feedback is anonymous (hide employee identity from reviewers)';
COMMENT ON COLUMN feedback_submissions.category IS 'Feedback category: work_environment, management, career, compensation, suggestion, other';
COMMENT ON COLUMN feedback_submissions.feedback_text IS 'The actual feedback content';
COMMENT ON COLUMN feedback_submissions.rating IS 'Optional rating from 1-5';
COMMENT ON COLUMN feedback_submissions.status IS 'Current status: submitted, read, acknowledged';
COMMENT ON COLUMN feedback_submissions.read_by IS 'Manager who first read the feedback';
COMMENT ON COLUMN feedback_submissions.acknowledged_by IS 'Manager who acknowledged/responded to feedback';
COMMENT ON COLUMN feedback_submissions.response_note IS 'Internal note from manager about the feedback';
