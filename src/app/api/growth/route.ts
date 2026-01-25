import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import {
  getGrowthProjects,
  getGrowthKeyDates,
  getGrowthPersonalFocus,
  getLatestGrowthSync,
  getGrowthTeamMembers
} from '@/lib/db';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

// Check if user is part of Growth Team or has management access
async function checkGrowthAccess(userId: string, userRole: string): Promise<boolean> {
  // Management roles always have access
  if (['general_manager', 'ceo'].includes(userRole)) {
    return true;
  }

  // Check if employee is part of Growth Team
  if (!isSupabaseAdminConfigured()) {
    return false;
  }

  const { data, error } = await supabaseAdmin!
    .from('employees')
    .select('is_growth_team')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return false;
  }

  return data.is_growth_team === true;
}

// GET /api/growth - Get Growth Team dashboard data
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user has Growth Team access
  const hasAccess = await checkGrowthAccess(user.id, user.role);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied. Growth Team members only.' }, { status: 403 });
  }

  try {
    // Fetch all Growth Team data in parallel
    const [projects, keyDates, personalFocus, latestSync, teamMembers] = await Promise.all([
      getGrowthProjects(),
      getGrowthKeyDates(),
      getGrowthPersonalFocus(),
      getLatestGrowthSync(),
      getGrowthTeamMembers(),
    ]);

    // Organize projects by priority
    const criticalProjects = projects.filter(p => p.priority === 'critical');
    const highPriorityProjects = projects.filter(p => p.priority === 'high');
    const strategicProjects = projects.filter(p => p.priority === 'strategic');
    const otherProjects = projects.filter(p => !['critical', 'high', 'strategic'].includes(p.priority || ''));

    // Summary stats
    const stats = {
      totalProjects: projects.length,
      criticalCount: criticalProjects.length,
      highPriorityCount: highPriorityProjects.length,
      inProgressCount: projects.filter(p => p.status === 'in_progress').length,
      blockedCount: projects.filter(p => p.status === 'blocked').length,
      teamMemberCount: teamMembers.length,
    };

    return NextResponse.json({
      projects: {
        all: projects,
        critical: criticalProjects,
        highPriority: highPriorityProjects,
        strategic: strategicProjects,
        other: otherProjects,
      },
      keyDates,
      personalFocus,
      latestSync,
      teamMembers,
      stats,
    });
  } catch (error) {
    console.error('Error fetching Growth Team data:', error);
    return NextResponse.json({ error: 'Failed to fetch Growth Team data' }, { status: 500 });
  }
}
