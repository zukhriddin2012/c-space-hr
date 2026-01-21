import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import type { User } from '@/types';

const STORAGE_BUCKET = 'employee-documents';

// GET /api/candidates/[id]/resume - Get signed URL for resume
export const GET = withAuth(async (
  request: NextRequest,
  context: { user: User; params?: Record<string, string> }
) => {
  try {
    if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    const id = context.params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    // Get candidate to find resume path
    const { data: candidate, error: fetchError } = await supabaseAdmin
      .from('candidates')
      .select('resume_file_path, resume_file_name')
      .eq('id', id)
      .single();

    if (fetchError || !candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    if (!candidate.resume_file_path) {
      return NextResponse.json({ error: 'No resume file found' }, { status: 404 });
    }

    // Create signed URL (valid for 1 hour)
    const { data: signedUrl, error: signError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(candidate.resume_file_path, 3600);

    if (signError || !signedUrl) {
      console.error('Error creating signed URL:', signError);
      return NextResponse.json({ error: 'Failed to generate download URL' }, { status: 500 });
    }

    // Check if file is a PDF (can be viewed in browser)
    const isPdf = candidate.resume_file_name?.toLowerCase().endsWith('.pdf');

    return NextResponse.json({
      url: signedUrl.signedUrl,
      fileName: candidate.resume_file_name,
      isPdf,
    });
  } catch (error) {
    console.error('Error getting resume URL:', error);
    return NextResponse.json({ error: 'Failed to get resume' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_VIEW });
