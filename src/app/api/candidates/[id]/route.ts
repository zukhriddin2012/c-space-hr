import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import {
  getCandidateById,
  updateCandidate,
  deleteCandidate,
} from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase';
import type { User } from '@/types';

// GET /api/candidates/[id] - Get candidate details
export const GET = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    const candidate = await getCandidateById(id);

    if (!candidate) {
      return NextResponse.json({ error: 'Candidate not found' }, { status: 404 });
    }

    return NextResponse.json({ candidate });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    return NextResponse.json({ error: 'Failed to fetch candidate' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_VIEW });

// PUT /api/candidates/[id] - Update candidate
export const PUT = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    const contentType = request.headers.get('content-type') || '';

    let updates: {
      full_name?: string;
      email?: string;
      phone?: string | null;
      iq_score?: number | null;
      mbti_type?: string | null;
      applied_role?: string;
      about?: string | null;
      resume_file_name?: string | null;
      resume_file_path?: string | null;
      resume_file_size?: number | null;
      source?: string | null;
      notes?: string | null;
    };

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();

      updates = {};

      // Only include fields that are provided
      if (formData.has('full_name')) updates.full_name = formData.get('full_name') as string;
      if (formData.has('email')) updates.email = formData.get('email') as string;
      if (formData.has('phone')) updates.phone = (formData.get('phone') as string) || null;
      if (formData.has('iq_score')) updates.iq_score = formData.get('iq_score') ? parseInt(formData.get('iq_score') as string) : null;
      if (formData.has('mbti_type')) updates.mbti_type = (formData.get('mbti_type') as string)?.toUpperCase() || null;
      if (formData.has('applied_role')) updates.applied_role = formData.get('applied_role') as string;
      if (formData.has('about')) updates.about = (formData.get('about') as string) || null;
      if (formData.has('source')) updates.source = (formData.get('source') as string) || null;
      if (formData.has('notes')) updates.notes = (formData.get('notes') as string) || null;

      // Handle resume file upload
      const resumeFile = formData.get('resume') as File | null;
      if (resumeFile && resumeFile.size > 0) {
        // Get existing candidate to delete old resume if exists
        const existingCandidate = await getCandidateById(id);
        if (existingCandidate?.resume_file_path) {
          await supabaseAdmin!.storage
            .from('recruitment')
            .remove([existingCandidate.resume_file_path]);
        }

        // Upload new resume
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${Date.now()}-${updates.full_name?.replace(/\s+/g, '_') || 'candidate'}.${fileExt}`;
        const filePath = `resumes/${fileName}`;

        const arrayBuffer = await resumeFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabaseAdmin!.storage
          .from('recruitment')
          .upload(filePath, buffer, {
            contentType: resumeFile.type,
            upsert: false,
          });

        if (uploadError) {
          console.error('Error uploading resume:', uploadError);
          return NextResponse.json({ error: 'Failed to upload resume' }, { status: 500 });
        }

        updates.resume_file_name = resumeFile.name;
        updates.resume_file_path = filePath;
        updates.resume_file_size = resumeFile.size;
      }
    } else {
      updates = await request.json();
    }

    // Validate MBTI type if provided
    if (updates.mbti_type) {
      const validMbtiTypes = [
        'INTJ', 'INTP', 'ENTJ', 'ENTP',
        'INFJ', 'INFP', 'ENFJ', 'ENFP',
        'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
        'ISTP', 'ISFP', 'ESTP', 'ESFP'
      ];
      if (!validMbtiTypes.includes(updates.mbti_type.toUpperCase())) {
        return NextResponse.json({ error: 'Invalid MBTI type' }, { status: 400 });
      }
      updates.mbti_type = updates.mbti_type.toUpperCase();
    }

    const result = await updateCandidate(id, updates);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      candidate: result.candidate,
    });
  } catch (error) {
    console.error('Error updating candidate:', error);
    return NextResponse.json({ error: 'Failed to update candidate' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_MANAGE });

// DELETE /api/candidates/[id] - Delete candidate
export const DELETE = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    // Get candidate to delete resume file if exists
    const candidate = await getCandidateById(id);
    if (candidate?.resume_file_path) {
      await supabaseAdmin!.storage
        .from('recruitment')
        .remove([candidate.resume_file_path]);
    }

    const result = await deleteCandidate(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting candidate:', error);
    return NextResponse.json({ error: 'Failed to delete candidate' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_MANAGE });
