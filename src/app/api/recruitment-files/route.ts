import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getRecruitmentFiles, createRecruitmentFile } from '@/lib/db';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import type { User } from '@/types';

// Use employee-documents bucket with recruitment subfolder
const STORAGE_BUCKET = 'employee-documents';

// GET /api/recruitment-files - List recruitment files
export const GET = withAuth(async (request: NextRequest, context: { user: User }) => {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const files = await getRecruitmentFiles(category);

    return NextResponse.json({ files });
  } catch (error) {
    console.error('Error fetching recruitment files:', error);
    return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_VIEW });

// POST /api/recruitment-files - Upload recruitment file
export const POST = withAuth(async (request: NextRequest, context: { user: User }) => {
  try {
    const { user } = context;
    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    const category = formData.get('category') as string;
    const role = (formData.get('role') as string) || null;
    const description = (formData.get('description') as string) || null;

    if (!file || file.size === 0) {
      return NextResponse.json({ error: 'File is required' }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: 'Category is required' }, { status: 400 });
    }

    // Validate category
    const validCategories = ['cm_program', 'term_sheet_template', 'other'];
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category. Valid categories: ' + validCategories.join(', ') },
        { status: 400 }
      );
    }

    // Check if storage is configured
    if (!isSupabaseAdminConfigured() || !supabaseAdmin) {
      console.error('Supabase storage not configured');
      return NextResponse.json({ error: 'Storage not configured' }, { status: 500 });
    }

    // Upload to Supabase storage (using employee-documents bucket with recruitment subfolder)
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/_+/g, '_');
    const fileName = `${Date.now()}-${cleanFileName}`;
    const filePath = `recruitment/${category}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file: ' + uploadError.message }, { status: 500 });
    }

    // Create database record
    const result = await createRecruitmentFile({
      file_name: file.name,
      file_path: filePath,
      file_size: file.size,
      mime_type: file.type,
      category,
      role,
      description,
      uploaded_by: user.employeeId,
    });

    if (!result.success) {
      // Cleanup uploaded file on DB error
      await supabaseAdmin.storage.from(STORAGE_BUCKET).remove([filePath]);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      file: result.file,
    });
  } catch (error) {
    console.error('Error uploading recruitment file:', error);
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_MANAGE });
