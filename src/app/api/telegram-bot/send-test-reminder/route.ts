import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://c-space-niya.vercel.app';

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Telegram bot not configured' }, { status: 500 });
    }

    // Try to get email from request body (optional)
    let email: string | null = null;
    try {
      const body = await request.json();
      email = body.email || null;
    } catch {
      // No body provided, will use fallback
    }

    let targetEmployee;

    if (email) {
      // Try to find employee by email
      const { data: employee } = await supabaseAdmin!
        .from('employees')
        .select('id, full_name, telegram_id')
        .eq('email', email)
        .single();

      if (employee?.telegram_id) {
        targetEmployee = employee;
      }
    }

    // Fallback: find first employee with telegram_id who has admin/hr role
    if (!targetEmployee) {
      const { data: fallbackEmployee, error: adminError } = await supabaseAdmin!
        .from('employees')
        .select('id, full_name, telegram_id')
        .not('telegram_id', 'is', null)
        .in('system_role', ['general_manager', 'hr_manager', 'branch_manager'])
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (!adminError && fallbackEmployee?.telegram_id) {
        targetEmployee = fallbackEmployee;
      }
    }

    // Final fallback: any employee with telegram_id
    if (!targetEmployee) {
      const { data: anyEmployee, error: anyError } = await supabaseAdmin!
        .from('employees')
        .select('id, full_name, telegram_id')
        .not('telegram_id', 'is', null)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (anyError || !anyEmployee?.telegram_id) {
        return NextResponse.json(
          { error: 'No employee with Telegram ID found. Please link your Telegram account first.' },
          { status: 400 }
        );
      }
      targetEmployee = anyEmployee;
    }

    // Send test message with checkout reminder button
    const message = `🧪 *Test Checkout Reminder*

This is a test message from the Admin Dashboard.

Click the button below to test the checkout flow:`;

    const keyboard = {
      inline_keyboard: [
        [
          {
            text: '⏰ Check Out Now',
            web_app: {
              url: `${WEBAPP_URL}/telegram/checkout-reminder?test=true`,
            },
          },
        ],
      ],
    };

    const response = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: targetEmployee.telegram_id,
          text: message,
          parse_mode: 'Markdown',
          reply_markup: keyboard,
        }),
      }
    );

    const result = await response.json();

    if (!result.ok) {
      console.error('Telegram API error:', result);
      return NextResponse.json(
        { error: result.description || 'Failed to send message to Telegram' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Test reminder sent to ${targetEmployee.full_name}`,
    });
  } catch (error) {
    console.error('Error sending test reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
