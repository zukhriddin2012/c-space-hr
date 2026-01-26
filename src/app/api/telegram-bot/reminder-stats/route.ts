import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

    // Get today's reminders count by shift type
    const { data: todayReminders, error: remindersError } = await supabaseAdmin!
      .from('checkout_reminders')
      .select('id, shift_type, status, response_type, ip_verified')
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`);

    if (remindersError) {
      console.error('Error fetching reminders:', remindersError);
      return NextResponse.json({ error: 'Failed to fetch reminder stats' }, { status: 500 });
    }

    const reminders = todayReminders || [];

    // Calculate stats
    const totalReminders = reminders.length;
    const dayShiftReminders = reminders.filter(r => r.shift_type === 'day').length;
    const nightShiftReminders = reminders.filter(r => r.shift_type === 'night').length;

    const respondedReminders = reminders.filter(r =>
      r.status === 'responded' || r.status === 'completed'
    ).length;
    const responseRate = totalReminders > 0
      ? Math.round((respondedReminders / totalReminders) * 100)
      : 0;

    const verifiedReminders = reminders.filter(r => r.ip_verified).length;
    const completedReminders = reminders.filter(r =>
      r.status === 'completed' || r.response_type === 'i_left'
    ).length;
    const verificationRate = completedReminders > 0
      ? Math.round((verifiedReminders / completedReminders) * 100)
      : 0;

    const pendingReminders = reminders.filter(r =>
      r.status === 'pending' || r.status === 'sent'
    ).length;

    // Get last week's response rate for comparison
    const lastWeekDate = new Date(date);
    lastWeekDate.setDate(lastWeekDate.getDate() - 7);
    const lastWeekDateStr = lastWeekDate.toISOString().split('T')[0];

    const { data: lastWeekReminders } = await supabaseAdmin!
      .from('checkout_reminders')
      .select('id, status')
      .gte('created_at', `${lastWeekDateStr}T00:00:00`)
      .lte('created_at', `${lastWeekDateStr}T23:59:59`);

    const lastWeekTotal = lastWeekReminders?.length || 0;
    const lastWeekResponded = lastWeekReminders?.filter(r =>
      r.status === 'responded' || r.status === 'completed'
    ).length || 0;
    const lastWeekResponseRate = lastWeekTotal > 0
      ? Math.round((lastWeekResponded / lastWeekTotal) * 100)
      : 0;

    const responseRateChange = responseRate - lastWeekResponseRate;

    return NextResponse.json({
      success: true,
      stats: {
        totalReminders,
        dayShiftReminders,
        nightShiftReminders,
        responseRate,
        responseRateChange,
        verificationRate,
        verifiedCount: verifiedReminders,
        completedCount: completedReminders,
        pendingReminders,
      },
    });
  } catch (error) {
    console.error('Reminder stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
