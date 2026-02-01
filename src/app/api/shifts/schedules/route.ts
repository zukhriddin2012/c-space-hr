import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS, hasPermission } from '@/lib/permissions';
import {
  getScheduleByWeek,
  getSchedules,
  createSchedule,
  type CreateScheduleInput,
} from '@/lib/db';
import type { User } from '@/types';

// GET /api/shifts/schedules - List schedules or get by week
export const GET = withAuth(async (request: NextRequest, context: { user: User }) => {
  try {
    const { searchParams } = new URL(request.url);
    const week = searchParams.get('week'); // YYYY-MM-DD (Monday)
    const status = searchParams.get('status') as 'draft' | 'published' | 'locked' | null;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    // If week specified, get single schedule
    if (week) {
      const schedule = await getScheduleByWeek(week);
      return NextResponse.json({ schedule });
    }

    // Otherwise list schedules
    const schedules = await getSchedules({
      status: status || undefined,
      limit
    });

    return NextResponse.json({ schedules });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    return NextResponse.json({ error: 'Failed to fetch schedules' }, { status: 500 });
  }
}, { permission: PERMISSIONS.SHIFTS_VIEW });

// POST /api/shifts/schedules - Create new schedule
export const POST = withAuth(async (request: NextRequest, context: { user: User }) => {
  try {
    // Check edit permission
    if (!hasPermission(context.user.role, PERMISSIONS.SHIFTS_EDIT)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body: CreateScheduleInput = await request.json();

    // Validate required fields
    if (!body.week_start_date) {
      return NextResponse.json(
        { error: 'week_start_date is required' },
        { status: 400 }
      );
    }

    // Validate week_start_date is a Monday
    const date = new Date(body.week_start_date);
    if (date.getDay() !== 1) {
      return NextResponse.json(
        { error: 'week_start_date must be a Monday' },
        { status: 400 }
      );
    }

    // Check if schedule already exists
    const existing = await getScheduleByWeek(body.week_start_date);
    if (existing) {
      return NextResponse.json(
        { error: 'Schedule for this week already exists', schedule: existing },
        { status: 409 }
      );
    }

    const schedule = await createSchedule(body);

    if (!schedule) {
      return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
    }

    return NextResponse.json({ success: true, schedule }, { status: 201 });
  } catch (error) {
    console.error('Error creating schedule:', error);
    return NextResponse.json({ error: 'Failed to create schedule' }, { status: 500 });
  }
}, { permission: PERMISSIONS.SHIFTS_VIEW });
