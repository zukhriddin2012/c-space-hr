import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import {
  getGrowthProjects,
  getGrowthKeyDates,
  getGrowthPersonalFocus,
  getLatestGrowthSync
} from '@/lib/db';

// Only GM/CEO can export
async function checkExportAccess(userRole: string): Promise<boolean> {
  return ['general_manager', 'ceo'].includes(userRole);
}

// GET /api/growth/export - Export current Growth data as Metronome Sync format
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user can export
  const hasAccess = await checkExportAccess(user.role);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied. Only GM/CEO can export sync data.' }, { status: 403 });
  }

  try {
    // Fetch all Growth Team data
    const [projects, keyDates, personalFocus, latestSync] = await Promise.all([
      getGrowthProjects(),
      getGrowthKeyDates(),
      getGrowthPersonalFocus(),
      getLatestGrowthSync(),
    ]);

    // Organize projects by priority
    const criticalProjects = projects.filter(p => p.priority === 'critical').map(p => ({
      title: p.title,
      tag: p.tag,
      deadline: p.deadline,
      owner: p.owner,
      accountable: p.accountable,
      details: p.description || p.details,
      actions: p.actions,
      alert: p.alert,
      status: p.status,
    }));

    const highPriorityProjects = projects.filter(p => p.priority === 'high').map(p => ({
      title: p.title,
      tag: p.tag,
      deadline: p.deadline,
      owner: p.owner,
      accountable: p.accountable,
      details: p.description || p.details,
      actions: p.actions,
      alert: p.alert,
      status: p.status,
    }));

    const strategicProjects = projects.filter(p => p.priority === 'strategic').map(p => ({
      title: p.title,
      tag: p.tag,
      deadline: p.deadline,
      owner: p.owner,
      accountable: p.accountable,
      details: p.description || p.details,
      actions: p.actions,
      alert: p.alert,
      status: p.status,
    }));

    // Build export structure
    const exportData = {
      meta: {
        title: 'C-Space Leadership Alignment',
        version: '2.0',
        exportedAt: new Date().toISOString(),
        exportedBy: user.name || 'Unknown',
        syncDate: latestSync?.sync_date || new Date().toISOString().split('T')[0],
        nextSync: latestSync ? {
          date: latestSync.next_sync_date,
          time: latestSync.next_sync_time,
          focus: latestSync.next_sync_focus,
        } : null,
      },
      summary: {
        critical: criticalProjects.length,
        highPriority: highPriorityProjects.length,
        strategic: strategicProjects.length,
        inProgress: projects.filter(p => p.status === 'in_progress').length,
        blocked: projects.filter(p => p.status === 'blocked').length,
      },
      items: {
        critical: criticalProjects,
        highPriority: highPriorityProjects,
        strategic: strategicProjects,
      },
      keyDates: keyDates.map(d => ({
        date: d.date,
        label: d.label,
        events: d.events,
        highlight: d.highlight,
        critical: d.critical,
      })),
      personalFocus: personalFocus.map(f => ({
        person: f.person,
        role: f.role,
        emoji: f.emoji,
        items: f.items,
      })),
      decisions: latestSync?.decisions || [],
      resolved: latestSync?.resolved || [],
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting Growth data:', error);
    return NextResponse.json({ error: 'Failed to export Growth data' }, { status: 500 });
  }
}
