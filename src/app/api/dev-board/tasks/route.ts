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

// GET /api/dev-board/tasks - Get all tasks with filters
export async function GET(request: NextRequest) {
  const access = await checkAccess();
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('project');
  const sprintId = searchParams.get('sprint');
  const status = searchParams.get('status');

  try {
    let query = supabaseAdmin!
      .from('dev_tasks')
      .select(`
        *,
        project:dev_projects(id, name, color, icon),
        sprint:dev_sprints(id, name, status)
      `)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }
    if (sprintId) {
      query = query.eq('sprint_id', sprintId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: tasks, error } = await query;

    if (error) {
      console.error('Error fetching tasks:', error);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    return NextResponse.json({ tasks });
  } catch (error) {
    console.error('Error in dev-board tasks API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/dev-board/tasks - Create a new task
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
    const {
      title,
      description,
      project_id,
      sprint_id,
      status = 'backlog',
      task_type = 'feature',
      priority = 'P1',
      category,
      estimate,
      due_date,
    } = body;

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const { data: task, error } = await supabaseAdmin!
      .from('dev_tasks')
      .insert({
        title,
        description,
        project_id,
        sprint_id,
        status,
        task_type,
        priority,
        category,
        estimate,
        due_date,
      })
      .select(`
        *,
        project:dev_projects(id, name, color, icon),
        sprint:dev_sprints(id, name, status)
      `)
      .single();

    if (error) {
      console.error('Error creating task:', error);
      return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
    }

    // Log activity
    await supabaseAdmin!
      .from('dev_task_activity')
      .insert({
        task_id: task.id,
        action: 'created',
        new_value: title,
        author: 'user',
      });

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
