import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';
import { DEMO_USERS } from '@/lib/auth';

// POST /api/admin/sync-passwords - Sync DEMO_USERS passwords to database
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const results: { email: string; status: string }[] = [];

    for (const demoUser of DEMO_USERS) {
      if (!demoUser.email) continue;

      // Find matching employee by email and update their password
      const { data, error } = await supabaseAdmin!
        .from('employees')
        .update({ password: demoUser.password })
        .eq('email', demoUser.email)
        .select('email')
        .maybeSingle();

      if (error) {
        results.push({ email: demoUser.email, status: `Error: ${error.message}` });
      } else if (data) {
        results.push({ email: demoUser.email, status: 'Updated' });
      } else {
        results.push({ email: demoUser.email, status: 'Not found in database' });
      }
    }

    const updated = results.filter(r => r.status === 'Updated').length;
    const notFound = results.filter(r => r.status === 'Not found in database').length;
    const errors = results.filter(r => r.status.startsWith('Error')).length;

    return NextResponse.json({
      success: true,
      message: `Synced ${updated} passwords, ${notFound} not found, ${errors} errors`,
      results,
    });
  } catch (error) {
    console.error('Error syncing passwords:', error);
    return NextResponse.json({ error: 'Failed to sync passwords' }, { status: 500 });
  }
}
