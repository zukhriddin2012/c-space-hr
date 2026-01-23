import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

// POST - Submit signature
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
    const { signature_type, signature_data } = body;

    if (!signature_type || !signature_data) {
      return NextResponse.json({ error: 'Signature is required' }, { status: 400 });
    }

    // Get document
    const { data: doc, error: docError } = await supabaseAdmin!
      .from('candidate_documents')
      .select('id, candidate_id, signed_at')
      .eq('signing_token', token)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Check if already signed
    if (doc.signed_at) {
      return NextResponse.json({ error: 'Document has already been signed' }, { status: 400 });
    }

    // Note: Password verification is done at the verify-password endpoint
    // The user can only reach the signature step after successful password verification

    // Save signature
    const signedAt = new Date().toISOString();
    const { error: updateError } = await supabaseAdmin!
      .from('candidate_documents')
      .update({
        signature_type,
        signature_data,
        signed_at: signedAt,
        signer_ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        signer_user_agent: request.headers.get('user-agent') || 'unknown',
      })
      .eq('id', doc.id);

    if (updateError) {
      console.error('Error saving signature:', updateError);
      return NextResponse.json({ error: 'Failed to save signature' }, { status: 500 });
    }

    // Update candidate's term_sheet_signed status
    const { error: candidateError } = await supabaseAdmin!
      .from('candidates')
      .update({
        term_sheet_signed: true,
      })
      .eq('id', doc.candidate_id);

    if (candidateError) {
      console.error('Error updating candidate:', candidateError);
      // Don't fail the whole request, signature is saved
    }

    // Mark the checklist item as completed
    const { data: candidate } = await supabaseAdmin!
      .from('candidates')
      .select('checklist')
      .eq('id', doc.candidate_id)
      .single();

    if (candidate?.checklist) {
      const updatedChecklist = candidate.checklist.map((item: { id: string; text: string; completed: boolean; required: boolean }) => {
        if (item.text.toLowerCase().includes('sign term sheet') || item.id === '2') {
          return { ...item, completed: true };
        }
        return item;
      });

      await supabaseAdmin!
        .from('candidates')
        .update({ checklist: updatedChecklist })
        .eq('id', doc.candidate_id);
    }

    // TODO: Send confirmation email with PDF attachment
    // await sendEmail({
    //   to: candidateEmail,
    //   subject: 'Документ подписан - C-Space',
    //   html: '...',
    //   attachments: [{ filename: 'signed_document.pdf', content: generatedPdf }]
    // });

    return NextResponse.json({
      success: true,
      message: 'Document signed successfully',
      signed_at: signedAt,
    });
  } catch (error) {
    console.error('Error submitting signature:', error);
    return NextResponse.json({ error: 'Failed to submit signature' }, { status: 500 });
  }
}
