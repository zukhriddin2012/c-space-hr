-- Add recruiter/company signature fields to candidate_documents
-- This enables the workflow: Recruiter signs first -> Candidate signs second

-- Add recruiter signature fields
ALTER TABLE candidate_documents
ADD COLUMN IF NOT EXISTS recruiter_signature_type VARCHAR(20) CHECK (recruiter_signature_type IN ('draw', 'type')),
ADD COLUMN IF NOT EXISTS recruiter_signature_data TEXT,
ADD COLUMN IF NOT EXISTS recruiter_signed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS recruiter_signed_by VARCHAR(255),
ADD COLUMN IF NOT EXISTS recruiter_signed_by_position VARCHAR(100);

-- Update status check to include 'draft' and 'approved' statuses
-- draft = created but not signed by recruiter
-- approved = signed by recruiter, ready for candidate
-- signed = signed by both parties
ALTER TABLE candidate_documents
DROP CONSTRAINT IF EXISTS candidate_documents_status_check;

ALTER TABLE candidate_documents
ADD CONSTRAINT candidate_documents_status_check
CHECK (status IN ('draft', 'approved', 'pending', 'sent', 'viewed', 'signed', 'expired'));

-- Update existing 'pending' documents to 'draft' if recruiter hasn't signed
UPDATE candidate_documents
SET status = 'draft'
WHERE status = 'pending' AND recruiter_signed_at IS NULL;

-- Comments
COMMENT ON COLUMN candidate_documents.recruiter_signature_type IS 'Type of recruiter signature: draw or type';
COMMENT ON COLUMN candidate_documents.recruiter_signature_data IS 'Recruiter signature data (Base64 PNG or JSON)';
COMMENT ON COLUMN candidate_documents.recruiter_signed_at IS 'When the recruiter signed the document';
COMMENT ON COLUMN candidate_documents.recruiter_signed_by IS 'Name of the recruiter who signed';
COMMENT ON COLUMN candidate_documents.recruiter_signed_by_position IS 'Position of the recruiter who signed';
