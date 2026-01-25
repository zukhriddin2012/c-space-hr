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

// POST /api/dev-board/sprints/[id]/complete - Complete sprint with options
export async function POST(
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

  try {
    const { id } = await params;
    const body = await request.json();
    const {
      incompleteTaskAction = 'backlog', // 'backlog' | 'next_sprint' | 'keep'
      nextSprintId
    } = body;

    // Get the sprint
    const { data: sprint, error: sprintError } = await supabaseAdmin!
      .from('dev_sprints')
      .select('*')
      .eq('id', id)
      .single();

    if (sprintError || !sprint) {
      return NextResponse.json({ error: 'Sprint not found' }, { status: 404 });
    }

    // Get incomplete tasks (not done)
    const { data: incompleteTasks, error: tasksError } = await supabaseAdmin!
      .from('dev_tasks')
      .select('id, status')
      .eq('sprint_id', id)
      .neq('status', 'done');

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
    }

    const incompleteTaskIds = incompleteTasks?.map(t => t.id) || [];

    // Handle incomplete tasks based on action
    if (incompleteTaskIds.length > 0) {
      if (incompleteTaskAction === 'backlog') {
        // Move to backlog (remove sprint_id)
        await supabaseAdmin!
          .from('dev_tasks')
          .update({ sprint_id: null, status: 'backlog' })
          .in('id', incompleteTaskIds);
      } else if (incompleteTaskAction === 'next_sprint' && nextSprintId) {
        // Move to next sprint
        await supabaseAdmin!
          .from('dev_tasks')
          .update({ sprint_id: nextSprintId })
          .in('id', incompleteTaskIds);
      }
      // 'keep' = leave them as-is in the completed sprint
    }

    // Mark sprint as completed
    const { data: updatedSprint, error: updateError } = await supabaseAdmin!
      .from('dev_sprints')
      .update({ status: 'completed' })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error completing sprint:', updateError);
      return NextResponse.json({ error: 'Failed to complete sprint' }, { status: 500 });
    }

    return NextResponse.json({
      sprint: updatedSprint,
      movedTasks: incompleteTaskIds.length,
      action: incompleteTaskAction
    });
  } catch (error) {
    console.error('Error completing sprint:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
