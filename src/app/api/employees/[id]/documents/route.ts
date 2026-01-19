import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getEmployeeDocuments, addEmployeeDocument, DOCUMENT_TYPES, DocumentType } from '@/lib/db';
import { uploadDocument, generateDocumentPath } from '@/lib/supabase-storage';
import type { User } from '@/types';

// GET /api/employees/[id]/documents - List all documents for an employee
export const GET = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const { params } = context;
    const employeeId = params?.id;

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    const documents = await getEmployeeDocuments(employeeId);

    return NextResponse.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT });

// POST /api/employees/[id]/documents - Upload a new document
export const POST = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const { user, params } = context;
    const employeeId = params?.id;

    if (!employeeId) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const documentType = formData.get('document_type') as string | null;
    const notes = formData.get('notes') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!documentType) {
      return NextResponse.json({ error: 'Document type is required' }, { status: 400 });
    }

    // Validate document type
    const validTypes = DOCUMENT_TYPES.map(t => t.value);
    if (!validTypes.includes(documentType as DocumentType)) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }

    // Check file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB' }, { status: 400 });
    }

    // Allowed file types
    const ALLOWED_TYPES = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({
        error: 'Invalid file type. Allowed: PDF, JPEG, PNG, WebP, DOC, DOCX'
      }, { status: 400 });
    }

    // Generate storage path
    const storagePath = generateDocumentPath(employeeId, documentType, file.name);

    // Convert File to Buffer for upload
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const uploadResult = await uploadDocument(buffer, storagePath, file.type);

    if (!uploadResult.success) {
      return NextResponse.json({
        error: uploadResult.error || 'Failed to upload file'
      }, { status: 500 });
    }

    // Save document metadata to database
    const result = await addEmployeeDocument({
      employee_id: employeeId,
      document_type: documentType as DocumentType,
      file_name: file.name,
      file_path: uploadResult.path || storagePath,
      file_size: file.size,
      mime_type: file.type,
      uploaded_by: user.id,
      notes: notes || undefined,
    });

    if (!result.success) {
      return NextResponse.json({
        error: result.error || 'Failed to save document'
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      document: result.document,
    });
  } catch (error) {
    console.error('Error uploading document:', error);
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT });
