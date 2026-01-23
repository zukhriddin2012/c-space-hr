import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

// GET - Fetch document info by signing token
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    // First try to get from candidate_documents table
    const { data: doc, error } = await supabaseAdmin!
      .from('candidate_documents')
      .select(`
        *,
        candidate:candidates(
          id,
          full_name,
          email,
          applied_role,
          probation_start_date,
          probation_end_date
        )
      `)
      .eq('signing_token', token)
      .single();

    if (error || !doc) {
      return NextResponse.json({ error: 'Document not found or link expired' }, { status: 404 });
    }

    // Format the response
    const document = {
      id: doc.id,
      candidate_id: doc.candidate_id,
      candidate_name: doc.candidate?.full_name || 'Unknown',
      candidate_email: doc.candidate?.email || '',
      document_type: doc.document_type || 'Условия трудоустройства',
      position: doc.candidate?.applied_role || 'Community Manager',
      branch: doc.branch || 'C-Space Yunusabad',
      start_date: doc.candidate?.probation_start_date || doc.start_date || '',
      end_date: doc.candidate?.probation_end_date || doc.end_date || '',
      salary: doc.salary || '2 000 000 сум',
      work_hours: doc.work_hours || '9:00 - 18:00',
      created_at: doc.created_at,
      signed_at: doc.signed_at,
      signature_data: doc.signature_data,
    };

    return NextResponse.json({ document });
  } catch (error) {
    console.error('Error fetching document:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}
