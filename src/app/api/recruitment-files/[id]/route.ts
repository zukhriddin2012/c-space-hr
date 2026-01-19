import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { deleteRecruitmentFile, getRecruitmentFiles } from '@/lib/db';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import type { User } from '@/types';

// Use employee-documents bucket with recruitment subfolder
const STORAGE_BUCKET = 'employee-documents';

// DELETE /api/recruitment-files/[id] - Delete recruitment file
export const DELETE = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
    }

    // Get file to find storage path
    const files = await getRecruitmentFiles();
    const file = files.find(f => f.id === id);

    if (!file) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Delete from storage
    if (file.file_path && isSupabaseAdminConfigured() && supabaseAdmin) {
      await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([file.file_path]);
    }

    // Delete from database
    const result = await deleteRecruitmentFile(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recruitment file:', error);
    return NextResponse.json({ error: 'Failed to delete file' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_MANAGE });
