import { NextResponse } from 'next/server';
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

// GET /api/dev-board/stats - Get board statistics
export async function GET() {
  const access = await checkAccess();
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    // Get all tasks
    const { data: tasks, error } = await supabaseAdmin!
      .from('dev_tasks')
      .select('status, task_type, priority, sprint_id');

    if (error) {
      console.error('Error fetching stats:', error);
      return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
    }

    // Get active sprint
    const { data: activeSprint } = await supabaseAdmin!
      .from('dev_sprints')
      .select('*')
      .eq('status', 'active')
      .single();

    // Calculate stats
    const allTasks = tasks || [];
    const sprintTasks = activeSprint
      ? allTasks.filter(t => t.sprint_id === activeSprint.id)
      : [];

    const stats = {
      total: allTasks.length,
      byStatus: {
        backlog: allTasks.filter(t => t.status === 'backlog').length,
        todo: allTasks.filter(t => t.status === 'todo').length,
        in_progress: allTasks.filter(t => t.status === 'in_progress').length,
        testing: allTasks.filter(t => t.status === 'testing').length,
        done: allTasks.filter(t => t.status === 'done').length,
      },
      byType: {
        feature: allTasks.filter(t => t.task_type === 'feature').length,
        bug: allTasks.filter(t => t.task_type === 'bug').length,
        improvement: allTasks.filter(t => t.task_type === 'improvement').length,
        task: allTasks.filter(t => t.task_type === 'task').length,
      },
      byPriority: {
        P0: allTasks.filter(t => t.priority === 'P0').length,
        P1: allTasks.filter(t => t.priority === 'P1').length,
        P2: allTasks.filter(t => t.priority === 'P2').length,
        P3: allTasks.filter(t => t.priority === 'P3').length,
      },
      activeSprint: activeSprint ? {
        ...activeSprint,
        total: sprintTasks.length,
        completed: sprintTasks.filter(t => t.status === 'done').length,
        inProgress: sprintTasks.filter(t => t.status === 'in_progress').length,
        progress: sprintTasks.length > 0
          ? Math.round((sprintTasks.filter(t => t.status === 'done').length / sprintTasks.length) * 100)
          : 0,
      } : null,
      bugs: {
        open: allTasks.filter(t => t.task_type === 'bug' && t.status !== 'done').length,
        total: allTasks.filter(t => t.task_type === 'bug').length,
      },
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error in stats API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
