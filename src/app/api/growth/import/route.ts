import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { createGrowthSync, GrowthProject, GrowthKeyDate, GrowthPersonalFocus } from '@/lib/db';

// Only GM/CEO can import Metronome Sync data
async function checkImportAccess(userRole: string): Promise<boolean> {
  return ['general_manager', 'ceo'].includes(userRole);
}

// POST /api/growth/import - Import Metronome Sync JSON
export async function POST(request: NextRequest) {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if user can import
  const hasAccess = await checkImportAccess(user.role);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Access denied. Only GM/CEO can import sync data.' }, { status: 403 });
  }

  try {
    const body = await request.json();

    // Validate basic structure
    if (!body.meta || !body.items) {
      return NextResponse.json({ error: 'Invalid Metronome Sync format. Missing meta or items.' }, { status: 400 });
    }

    const meta = body.meta;

    // Parse projects from items
    const projects: Partial<GrowthProject>[] = [];

    // Critical projects
    if (body.items.critical && Array.isArray(body.items.critical)) {
      body.items.critical.forEach((item: Record<string, unknown>, index: number) => {
        projects.push({
          title: item.title as string || `Critical Item ${index + 1}`,
          tag: item.tag as string || null,
          priority: 'critical',
          status: 'pending',
          deadline: item.deadline as string || null,
          owner: item.owner as string || null,
          accountable: item.accountable as string[] || null,
          description: item.details as string || null,
          details: typeof item.details === 'object' ? item.details as Record<string, unknown> : null,
          actions: item.actions as Record<string, unknown>[] || null,
          alert: item.alert as string || null,
          source_key: `critical_${index}`,
        });
      });
    }

    // High priority projects
    if (body.items.highPriority && Array.isArray(body.items.highPriority)) {
      body.items.highPriority.forEach((item: Record<string, unknown>, index: number) => {
        projects.push({
          title: item.title as string || `High Priority Item ${index + 1}`,
          tag: item.tag as string || null,
          priority: 'high',
          status: 'pending',
          deadline: item.deadline as string || null,
          owner: item.owner as string || null,
          accountable: item.accountable as string[] || null,
          description: item.details as string || null,
          details: typeof item.details === 'object' ? item.details as Record<string, unknown> : null,
          actions: item.actions as Record<string, unknown>[] || null,
          alert: item.alert as string || null,
          source_key: `high_${index}`,
        });
      });
    }

    // Strategic projects
    if (body.items.strategic && Array.isArray(body.items.strategic)) {
      body.items.strategic.forEach((item: Record<string, unknown>, index: number) => {
        projects.push({
          title: item.title as string || `Strategic Item ${index + 1}`,
          tag: item.tag as string || null,
          priority: 'strategic',
          status: 'pending',
          deadline: item.deadline as string || null,
          owner: item.owner as string || null,
          accountable: item.accountable as string[] || null,
          description: item.details as string || null,
          details: typeof item.details === 'object' ? item.details as Record<string, unknown> : null,
          actions: item.actions as Record<string, unknown>[] || null,
          alert: item.alert as string || null,
          source_key: `strategic_${index}`,
        });
      });
    }

    // Parse key dates
    const keyDates: Partial<GrowthKeyDate>[] = [];
    if (body.keyDates && Array.isArray(body.keyDates)) {
      body.keyDates.forEach((dateItem: Record<string, unknown>) => {
        keyDates.push({
          date: dateItem.date as string,
          label: dateItem.label as string || '',
          events: dateItem.events as string || '',
          highlight: dateItem.highlight as boolean || false,
          critical: dateItem.critical as boolean || false,
        });
      });
    }

    // Parse personal focus
    const personalFocus: Partial<GrowthPersonalFocus>[] = [];
    if (body.personalFocus && Array.isArray(body.personalFocus)) {
      body.personalFocus.forEach((person: Record<string, unknown>) => {
        personalFocus.push({
          person: person.person as string || person.name as string || 'Unknown',
          role: person.role as string || null,
          emoji: person.emoji as string || null,
          items: person.items as string[] || [],
          sync_date: meta.syncDate as string || null,
        });
      });
    }

    // Create the sync record with all data
    const result = await createGrowthSync(
      {
        title: meta.title || 'Metronome Sync',
        sync_date: meta.syncDate || new Date().toISOString().split('T')[0],
        next_sync_date: meta.nextSync?.date || null,
        next_sync_time: meta.nextSync?.time || null,
        next_sync_focus: meta.nextSync?.focus || null,
        resolved: body.resolved || null,
        summary: body.summary || null,
        decisions: body.decisions || null,
        raw_import: body,
        imported_by: user.id,
      },
      projects,
      keyDates,
      personalFocus
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to import sync data' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported Metronome Sync: ${projects.length} projects, ${keyDates.length} key dates, ${personalFocus.length} personal focus items`,
      sync: result.sync,
      counts: {
        projects: projects.length,
        keyDates: keyDates.length,
        personalFocus: personalFocus.length,
      },
    });
  } catch (error) {
    console.error('Error importing Metronome Sync:', error);
    return NextResponse.json({ error: 'Failed to import sync data' }, { status: 500 });
  }
}
