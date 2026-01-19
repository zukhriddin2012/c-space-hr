import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import {
  getCandidates,
  createCandidate,
  type CandidateStage,
} from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase';
import type { User } from '@/types';

// GET /api/candidates - List all candidates
export const GET = withAuth(async (request: NextRequest, context: { user: User }) => {
  try {
    const { searchParams } = new URL(request.url);
    const stage = searchParams.get('stage') as CandidateStage | undefined;

    const candidates = await getCandidates(stage || undefined);

    return NextResponse.json({ candidates });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_VIEW });

// POST /api/candidates - Create new candidate
export const POST = withAuth(async (request: NextRequest, context: { user: User }) => {
  try {
    const contentType = request.headers.get('content-type') || '';

    let candidateData: {
      full_name: string;
      email: string;
      phone?: string | null;
      iq_score?: number | null;
      mbti_type?: string | null;
      applied_role: string;
      about?: string | null;
      resume_file_name?: string | null;
      resume_file_path?: string | null;
      resume_file_size?: number | null;
      source?: string | null;
      notes?: string | null;
    };

    if (contentType.includes('multipart/form-data')) {
      // Handle form data with file upload
      const formData = await request.formData();

      candidateData = {
        full_name: formData.get('full_name') as string,
        email: formData.get('email') as string,
        phone: (formData.get('phone') as string) || null,
        iq_score: formData.get('iq_score') ? parseInt(formData.get('iq_score') as string) : null,
        mbti_type: (formData.get('mbti_type') as string) || null,
        applied_role: formData.get('applied_role') as string,
        about: (formData.get('about') as string) || null,
        source: (formData.get('source') as string) || null,
        notes: (formData.get('notes') as string) || null,
      };

      // Handle resume file upload
      const resumeFile = formData.get('resume') as File | null;
      if (resumeFile && resumeFile.size > 0) {
        // Upload to Supabase storage
        const fileExt = resumeFile.name.split('.').pop();
        const fileName = `${Date.now()}-${candidateData.full_name.replace(/\s+/g, '_')}.${fileExt}`;
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

        candidateData.resume_file_name = resumeFile.name;
        candidateData.resume_file_path = filePath;
        candidateData.resume_file_size = resumeFile.size;
      }
    } else {
      // Handle JSON body
      candidateData = await request.json();
    }

    // Validate required fields
    if (!candidateData.full_name || !candidateData.email || !candidateData.applied_role) {
      return NextResponse.json(
        { error: 'Full name, email, and applied role are required' },
        { status: 400 }
      );
    }

    // Validate MBTI type if provided
    const validMbtiTypes = [
      'INTJ', 'INTP', 'ENTJ', 'ENTP',
      'INFJ', 'INFP', 'ENFJ', 'ENFP',
      'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
      'ISTP', 'ISFP', 'ESTP', 'ESFP'
    ];
    if (candidateData.mbti_type && !validMbtiTypes.includes(candidateData.mbti_type.toUpperCase())) {
      return NextResponse.json(
        { error: 'Invalid MBTI type' },
        { status: 400 }
      );
    }
    if (candidateData.mbti_type) {
      candidateData.mbti_type = candidateData.mbti_type.toUpperCase();
    }

    const result = await createCandidate(candidateData);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      candidate: result.candidate,
    });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json({ error: 'Failed to create candidate' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_MANAGE });
