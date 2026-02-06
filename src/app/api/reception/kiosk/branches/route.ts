import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/db/connection';

// GET /api/reception/kiosk/branches — Public endpoint, returns branches with kiosk enabled
export async function GET() {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ branches: [] });
    }

    const { data: branches, error } = await supabaseAdmin!
      .from('branches')
      .select('id, name')
      .not('reception_password_hash', 'is', null)
      .order('name');

    if (error) {
      console.error('Error fetching kiosk branches:', error);
      return NextResponse.json({ branches: [] });
    }

    return NextResponse.json({ branches: branches || [] });
  } catch (error) {
    console.error('Error fetching kiosk branches:', error);
    return NextResponse.json({ branches: [] });
  }
}
