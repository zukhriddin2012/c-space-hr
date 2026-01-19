import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getEmployeeDocumentById, deleteEmployeeDocument } from '@/lib/db';
import { deleteDocument, getSignedDownloadUrl } from '@/lib/supabase-storage';
import type { User } from '@/types';

// GET /api/employees/[id]/documents/[docId] - Get download URL for a document
export const GET = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const { params } = context;
    const documentId = params?.docId;

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Get document metadata
    const document = await getEmployeeDocumentById(documentId);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Generate signed download URL (valid for 1 hour)
    const { url, error } = await getSignedDownloadUrl(document.file_path, 3600);

    if (error || !url) {
      return NextResponse.json({
        error: error || 'Failed to generate download URL'
      }, { status: 500 });
    }

    return NextResponse.json({
      document,
      download_url: url,
    });
  } catch (error) {
    console.error('Error getting document download URL:', error);
    return NextResponse.json({ error: 'Failed to get download URL' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT });

// DELETE /api/employees/[id]/documents/[docId] - Delete a document
export const DELETE = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const { params } = context;
    const documentId = params?.docId;

    if (!documentId) {
      return NextResponse.json({ error: 'Document ID is required' }, { status: 400 });
    }

    // Get document metadata first to get the storage path
    const document = await getEmployeeDocumentById(documentId);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Delete from Supabase Storage
    const storageResult = await deleteDocument(document.file_path);

    if (!storageResult.success) {
      console.error('Failed to delete from storage:', storageResult.error);
      // Continue anyway to delete database record
    }

    // Delete from database
    const dbResult = await deleteEmployeeDocument(documentId);

    if (!dbResult.success) {
      return NextResponse.json({
        error: dbResult.error || 'Failed to delete document'
      }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}, { permission: PERMISSIONS.EMPLOYEES_EDIT });
