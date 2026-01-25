import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

// Only general_manager can access dev board
async function checkAccess() {
  const user = await getSession();
  if (!user) return { allowed: false, error: 'Unauthorized', status: 401 };
  if (user.role !== 'general_manager') {
    return { allowed: false, error: 'Access denied', status: 403 };
  }
  return { allowed: true, user };
}

// GET /api/dev-board/sprints - Get all sprints
export async function GET() {
  const access = await checkAccess();
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const { data: sprints, error } = await supabaseAdmin!
      .from('dev_sprints')
      .select('*')
      .order('start_date', { ascending: false });

    if (error) {
      console.error('Error fetching sprints:', error);
      return NextResponse.json({ error: 'Failed to fetch sprints' }, { status: 500 });
    }

    return NextResponse.json({ sprints });
  } catch (error) {
    console.error('Error in sprints API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/dev-board/sprints - Create new sprint
export async function POST(request: NextRequest) {
  const access = await checkAccess();
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { name, goal, start_date, end_date, status = 'planning' } = body;

    if (!name || !start_date || !end_date) {
      return NextResponse.json({ error: 'Name, start_date, and end_date are required' }, { status: 400 });
    }

    const { data: sprint, error } = await supabaseAdmin!
      .from('dev_sprints')
      .insert({ name, goal, start_date, end_date, status })
      .select()
      .single();

    if (error) {
      console.error('Error creating sprint:', error);
      return NextResponse.json({ error: 'Failed to create sprint' }, { status: 500 });
    }

    return NextResponse.json({ sprint });
  } catch (error) {
    console.error('Error creating sprint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
