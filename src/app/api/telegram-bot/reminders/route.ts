import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const status = searchParams.get('status'); // pending, completed, scheduled, all
    const shiftType = searchParams.get('shift'); // day, night, all
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    let query = supabaseAdmin!
      .from('checkout_reminders')
      .select(`
        *,
        employees(id, full_name, telegram_id, employee_id),
        attendance(id, check_in, check_out, date)
      `)
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    // Apply filters
    if (status && status !== 'all') {
      if (status === 'pending') {
        query = query.in('status', ['pending', 'sent']);
      } else if (status === 'completed') {
        query = query.in('status', ['completed', 'responded']);
      } else if (status === 'scheduled') {
        query = query.eq('status', 'scheduled');
      }
    }

    if (shiftType && shiftType !== 'all') {
      query = query.eq('shift_type', shiftType);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching reminders:', error);
      return NextResponse.json({ error: 'Failed to fetch reminders' }, { status: 500 });
    }

    // Format the data for the frontend
    const reminders = (data || []).map(reminder => ({
      id: reminder.id,
      employeeId: reminder.employee_id,
      employeeName: reminder.employees?.full_name || 'Unknown',
      employeeCode: reminder.employees?.employee_id || '',
      telegramId: reminder.employees?.telegram_id,
      shiftType: reminder.shift_type,
      status: reminder.status,
      responseType: reminder.response_type,
      ipVerified: reminder.ip_verified,
      ipAddress: reminder.ip_address,
      sentAt: reminder.reminder_sent_at,
      respondedAt: reminder.response_received_at,
      scheduledFor: reminder.scheduled_for,
      createdAt: reminder.created_at,
      attendance: reminder.attendance ? {
        id: reminder.attendance.id,
        checkIn: reminder.attendance.check_in,
        checkOut: reminder.attendance.check_out,
        date: reminder.attendance.date,
      } : null,
    }));

    // Get total count for pagination
    const { count } = await supabaseAdmin!
      .from('checkout_reminders')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', `${date}T00:00:00`)
      .lte('created_at', `${date}T23:59:59`);

    return NextResponse.json({
      success: true,
      reminders,
      total: count || 0,
      limit,
      offset,
    });
  } catch (error) {
    console.error('Reminders list error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Retry failed reminders
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { action, reminderId, reminderIds } = body;

    if (action === 'retry') {
      // Reset status to pending for retry
      const ids = reminderIds || (reminderId ? [reminderId] : []);
      if (ids.length === 0) {
        return NextResponse.json({ error: 'No reminder IDs provided' }, { status: 400 });
      }

      const { error } = await supabaseAdmin!
        .from('checkout_reminders')
        .update({ status: 'pending', reminder_sent_at: null })
        .in('id', ids);

      if (error) {
        return NextResponse.json({ error: 'Failed to retry reminders' }, { status: 500 });
      }

      return NextResponse.json({ success: true, retriedCount: ids.length });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Reminder action error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
