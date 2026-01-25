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

// GET /api/dev-board/export - Export board data as JSON
export async function GET() {
  const access = await checkAccess();
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    // Get all tasks with their comments
    const { data: tasks, error: tasksError } = await supabaseAdmin!
      .from('dev_tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (tasksError) {
      console.error('Error fetching tasks:', tasksError);
      return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
    }

    // Get all comments
    const { data: comments, error: commentsError } = await supabaseAdmin!
      .from('dev_task_comments')
      .select('*')
      .order('created_at', { ascending: true });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
    }

    // Get all sprints
    const { data: sprints, error: sprintsError } = await supabaseAdmin!
      .from('dev_sprints')
      .select('*')
      .order('start_date', { ascending: false });

    if (sprintsError) {
      console.error('Error fetching sprints:', sprintsError);
    }

    // Get all projects
    const { data: projects, error: projectsError } = await supabaseAdmin!
      .from('dev_projects')
      .select('*');

    if (projectsError) {
      console.error('Error fetching projects:', projectsError);
    }

    // Group comments by task
    const commentsByTask: Record<string, typeof comments> = {};
    comments?.forEach(comment => {
      if (!commentsByTask[comment.task_id]) {
        commentsByTask[comment.task_id] = [];
      }
      commentsByTask[comment.task_id].push(comment);
    });

    // Build export structure
    const exportData = {
      _meta: {
        exported_at: new Date().toISOString(),
        version: '1.0',
        format: 'jarvis-devboard-export',
        instructions: 'Add your responses to the jarvis_responses array for each task. Each response needs: content (your message). The import will create comments from Jarvis.',
      },
      sprints: sprints?.map(s => ({
        id: s.id,
        name: s.name,
        goal: s.goal,
        status: s.status,
        start_date: s.start_date,
        end_date: s.end_date,
      })) || [],
      projects: projects?.map(p => ({
        id: p.id,
        name: p.name,
        color: p.color,
      })) || [],
      tasks: tasks?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        task_type: task.task_type,
        category: task.category,
        estimate: task.estimate,
        sprint_id: task.sprint_id,
        project_id: task.project_id,
        created_at: task.created_at,
        comments: commentsByTask[task.id]?.map(c => ({
          id: c.id,
          author: c.author,
          content: c.content,
          created_at: c.created_at,
        })) || [],
        // This is where Jarvis adds responses
        jarvis_responses: [],
        // Optional: Jarvis can suggest status changes
        jarvis_suggested_status: null,
        // Optional: Jarvis can suggest priority changes
        jarvis_suggested_priority: null,
      })) || [],
      // Global suggestions from Jarvis
      jarvis_summary: null,
      jarvis_recommendations: [],
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting board:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
