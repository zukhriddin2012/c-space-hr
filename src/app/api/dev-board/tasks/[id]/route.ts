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

// GET /api/dev-board/tasks/[id] - Get single task with comments
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkAccess();
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { id } = await params;

  try {
    const { data: task, error: taskError } = await supabaseAdmin!
      .from('dev_tasks')
      .select(`
        *,
        project:dev_projects(id, name, color, icon),
        sprint:dev_sprints(id, name, status)
      `)
      .eq('id', id)
      .single();

    if (taskError) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    // Get comments
    const { data: comments } = await supabaseAdmin!
      .from('dev_task_comments')
      .select('*')
      .eq('task_id', id)
      .order('created_at', { ascending: true });

    // Get activity
    const { data: activity } = await supabaseAdmin!
      .from('dev_task_activity')
      .select('*')
      .eq('task_id', id)
      .order('created_at', { ascending: false })
      .limit(20);

    return NextResponse.json({ task, comments: comments || [], activity: activity || [] });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/dev-board/tasks/[id] - Update task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkAccess();
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const {
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
      sort_order,
    } = body;

    // Get current task for activity logging
    const { data: oldTask } = await supabaseAdmin!
      .from('dev_tasks')
      .select('*')
      .eq('id', id)
      .single();

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (project_id !== undefined) updates.project_id = project_id;
    if (sprint_id !== undefined) updates.sprint_id = sprint_id;
    if (status !== undefined) {
      updates.status = status;
      if (status === 'done' && oldTask?.status !== 'done') {
        updates.completed_at = new Date().toISOString();
      } else if (status !== 'done') {
        updates.completed_at = null;
      }
    }
    if (task_type !== undefined) updates.task_type = task_type;
    if (priority !== undefined) updates.priority = priority;
    if (category !== undefined) updates.category = category;
    if (estimate !== undefined) updates.estimate = estimate;
    if (due_date !== undefined) updates.due_date = due_date;
    if (sort_order !== undefined) updates.sort_order = sort_order;

    const { data: task, error } = await supabaseAdmin!
      .from('dev_tasks')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        project:dev_projects(id, name, color, icon),
        sprint:dev_sprints(id, name, status)
      `)
      .single();

    if (error) {
      console.error('Error updating task:', error);
      return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
    }

    // Log status change
    if (status && oldTask && oldTask.status !== status) {
      await supabaseAdmin!
        .from('dev_task_activity')
        .insert({
          task_id: id,
          action: 'status_changed',
          old_value: oldTask.status,
          new_value: status,
          author: body.author || 'user',
        });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/dev-board/tasks/[id] - Delete task
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await checkAccess();
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  const { id } = await params;

  try {
    const { error } = await supabaseAdmin!
      .from('dev_tasks')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting task:', error);
      return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
