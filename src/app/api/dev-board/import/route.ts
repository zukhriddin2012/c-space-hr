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

interface JarvisResponse {
  content: string;
}

interface ImportTask {
  id: string;
  jarvis_responses?: JarvisResponse[];
  jarvis_suggested_status?: string | null;
  jarvis_suggested_priority?: string | null;
}

interface ImportData {
  _meta?: {
    format?: string;
  };
  tasks?: ImportTask[];
  jarvis_summary?: string | null;
  jarvis_recommendations?: string[];
}

// POST /api/dev-board/import - Import Jarvis responses
export async function POST(request: NextRequest) {
  const access = await checkAccess();
  if (!access.allowed) {
    return NextResponse.json({ error: access.error }, { status: access.status });
  }

  if (!isSupabaseAdminConfigured()) {
    return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
  }

  try {
    const data: ImportData = await request.json();

    // Validate format
    if (!data._meta?.format || data._meta.format !== 'jarvis-devboard-export') {
      return NextResponse.json({
        error: 'Invalid format. Expected jarvis-devboard-export format.'
      }, { status: 400 });
    }

    const results = {
      comments_added: 0,
      tasks_updated: 0,
      errors: [] as string[],
    };

    // Process each task
    for (const task of data.tasks || []) {
      // Add Jarvis responses as comments
      if (task.jarvis_responses && task.jarvis_responses.length > 0) {
        for (const response of task.jarvis_responses) {
          if (response.content?.trim()) {
            const { error } = await supabaseAdmin!
              .from('dev_task_comments')
              .insert({
                task_id: task.id,
                author: 'Jarvis',
                content: response.content.trim(),
              });

            if (error) {
              results.errors.push(`Failed to add comment to task ${task.id}: ${error.message}`);
            } else {
              results.comments_added++;
            }
          }
        }
      }

      // Apply suggested status change (optional)
      if (task.jarvis_suggested_status) {
        const validStatuses = ['backlog', 'todo', 'in_progress', 'testing', 'done'];
        if (validStatuses.includes(task.jarvis_suggested_status)) {
          const { error } = await supabaseAdmin!
            .from('dev_tasks')
            .update({ status: task.jarvis_suggested_status })
            .eq('id', task.id);

          if (error) {
            results.errors.push(`Failed to update status for task ${task.id}: ${error.message}`);
          } else {
            results.tasks_updated++;
          }
        }
      }

      // Apply suggested priority change (optional)
      if (task.jarvis_suggested_priority) {
        const validPriorities = ['P0', 'P1', 'P2', 'P3'];
        if (validPriorities.includes(task.jarvis_suggested_priority)) {
          const { error } = await supabaseAdmin!
            .from('dev_tasks')
            .update({ priority: task.jarvis_suggested_priority })
            .eq('id', task.id);

          if (error) {
            results.errors.push(`Failed to update priority for task ${task.id}: ${error.message}`);
          } else {
            results.tasks_updated++;
          }
        }
      }
    }

    // If there's a global summary, we could create a special "board note" or just return it
    const summary = {
      ...results,
      jarvis_summary: data.jarvis_summary || null,
      jarvis_recommendations: data.jarvis_recommendations || [],
    };

    return NextResponse.json({
      success: true,
      ...summary,
    });
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
