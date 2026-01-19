-- Recruitment files table for CM 2-week program files and other onboarding materials
CREATE TABLE IF NOT EXISTS recruitment_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- File info
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,  -- Supabase storage path
  file_size INTEGER NOT NULL,
  mime_type TEXT,

  -- Categorization
  category TEXT NOT NULL,  -- 'cm_program', 'term_sheet_template', 'other'
  role TEXT,  -- Optional: specific role this file is for

  -- Metadata
  description TEXT,
  uploaded_by UUID REFERENCES employees(id),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_recruitment_files_category ON recruitment_files(category);
CREATE INDEX idx_recruitment_files_role ON recruitment_files(role);
