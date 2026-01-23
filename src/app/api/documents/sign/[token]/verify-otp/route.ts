import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

// POST - Verify OTP code
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { otp } = body;

    if (!otp || otp.length !== 6) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Get document and verify OTP
    const { data: doc, error: docError } = await supabaseAdmin!
      .from('candidate_documents')
      .select('id, otp_code, otp_expires_at')
      .eq('signing_token', token)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if OTP matches
    if (doc.otp_code !== otp) {
      return NextResponse.json({ error: 'Неверный код подтверждения' }, { status: 400 });
    }

    // Check if OTP has expired
    if (doc.otp_expires_at && new Date(doc.otp_expires_at) < new Date()) {
      return NextResponse.json({ error: 'Код истёк. Запросите новый код.' }, { status: 400 });
    }

    // Mark OTP as verified (clear it so it can't be reused)
    const { error: updateError } = await supabaseAdmin!
      .from('candidate_documents')
      .update({
        otp_verified_at: new Date().toISOString(),
        otp_code: null,
        otp_expires_at: null,
      })
      .eq('id', doc.id);

    if (updateError) {
      console.error('Error updating verification status:', updateError);
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 });
  }
}
