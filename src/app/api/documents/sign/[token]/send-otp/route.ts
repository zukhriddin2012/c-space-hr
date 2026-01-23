import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

// POST - Send OTP to candidate's email
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
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Verify the document exists and email matches
    const { data: doc, error: docError } = await supabaseAdmin!
      .from('candidate_documents')
      .select(`
        *,
        candidate:candidates(email)
      `)
      .eq('signing_token', token)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Verify email matches (case-insensitive)
    if (doc.candidate?.email?.toLowerCase() !== email.toLowerCase()) {
      return NextResponse.json({ error: 'Email does not match our records' }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store OTP in document record
    const { error: updateError } = await supabaseAdmin!
      .from('candidate_documents')
      .update({
        otp_code: otp,
        otp_expires_at: expiresAt.toISOString(),
      })
      .eq('id', doc.id);

    if (updateError) {
      console.error('Error storing OTP:', updateError);
      return NextResponse.json({ error: 'Failed to generate verification code' }, { status: 500 });
    }

    // In production, send email with OTP
    // For now, we'll log it (in dev) and the email would be sent via a service like SendGrid/Resend
    console.log(`[DEV] OTP for ${email}: ${otp}`);

    // TODO: Implement actual email sending
    // await sendEmail({
    //   to: email,
    //   subject: 'Код подтверждения для подписания документа - C-Space',
    //   html: `<p>Ваш код подтверждения: <strong>${otp}</strong></p><p>Код действителен 10 минут.</p>`
    // });

    return NextResponse.json({
      success: true,
      message: 'Verification code sent',
      // Only include OTP in development for testing
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send verification code' }, { status: 500 });
  }
}
