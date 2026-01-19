-- Candidates table for recruitment pipeline
CREATE TABLE IF NOT EXISTS candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Basic Info
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,

  -- Assessment Data
  iq_score INTEGER,
  mbti_type TEXT,  -- e.g., 'INTJ', 'ENFP'

  -- Application Info
  applied_role TEXT NOT NULL,
  about TEXT,  -- Candidate description/notes

  -- Resume
  resume_file_name TEXT,
  resume_file_path TEXT,  -- Supabase storage path
  resume_file_size INTEGER,

  -- Pipeline Stage
  stage TEXT NOT NULL DEFAULT 'screening',
  -- Stages: 'screening', 'interview_1', 'interview_2', 'under_review', 'probation', 'hired', 'rejected'

  -- Probation tracking (when moved to probation stage)
  probation_employee_id UUID REFERENCES employees(id),  -- Temporary account created
  probation_start_date DATE,
  probation_end_date DATE,

  -- Checklist items (JSON array for flexibility)
  checklist JSONB DEFAULT '[]',

  -- Tracking
  source TEXT,  -- Where candidate came from (LinkedIn, referral, etc.)
  notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  stage_changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_candidates_stage ON candidates(stage);
CREATE INDEX idx_candidates_email ON candidates(email);
CREATE INDEX idx_candidates_role ON candidates(applied_role);
CREATE INDEX idx_candidates_created ON candidates(created_at DESC);

-- Constraints
ALTER TABLE candidates
ADD CONSTRAINT chk_candidate_stage
CHECK (stage IN ('screening', 'interview_1', 'interview_2', 'under_review', 'probation', 'hired', 'rejected'));

ALTER TABLE candidates
ADD CONSTRAINT chk_mbti_type
CHECK (mbti_type IS NULL OR mbti_type IN (
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
));

-- Trigger for updated_at
CREATE TRIGGER update_candidates_updated_at
    BEFORE UPDATE ON candidates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
