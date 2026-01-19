-- Employee Documents Migration
-- Creates table for storing employee document metadata
-- Actual files are stored in Supabase Storage

-- Create the employee_documents table
CREATE TABLE IF NOT EXISTS employee_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,  -- 'term_sheet', 'contract', 'passport', 'id_card', 'diploma', 'other'
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,      -- Supabase storage path
  file_size INTEGER NOT NULL,   -- bytes
  mime_type TEXT,
  uploaded_by UUID REFERENCES employees(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_employee_documents_employee ON employee_documents(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_documents_type ON employee_documents(document_type);
CREATE INDEX IF NOT EXISTS idx_employee_documents_created ON employee_documents(created_at DESC);

-- Add constraint for document types
ALTER TABLE employee_documents
ADD CONSTRAINT chk_document_type
CHECK (document_type IN ('term_sheet', 'contract', 'passport', 'id_card', 'diploma', 'other'));

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_employee_documents_updated_at ON employee_documents;
CREATE TRIGGER update_employee_documents_updated_at
    BEFORE UPDATE ON employee_documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE employee_documents IS 'Stores metadata for employee documents (files stored in Supabase Storage)';
COMMENT ON COLUMN employee_documents.document_type IS 'Type of document: term_sheet, contract, passport, id_card, diploma, other';
COMMENT ON COLUMN employee_documents.file_path IS 'Path to file in Supabase Storage: employee_id/document_type/filename';
COMMENT ON COLUMN employee_documents.uploaded_by IS 'Employee ID of user who uploaded the document';
