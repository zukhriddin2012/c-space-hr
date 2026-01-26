import { NextResponse } from 'next/server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://c-space-hr.vercel.app';

export async function POST() {
  try {
    if (!isSupabaseAdminConfigured()) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    if (!BOT_TOKEN) {
      return NextResponse.json({ error: 'Telegram bot not configured' }, { status: 500 });
    }

    // Get the admin user's telegram_id from employees table
    // For now, we'll try to find an admin or HR user
    const { data: adminEmployee, error: adminError } = await supabaseAdmin!
      .from('employees')
      .select('id, full_name, telegram_id')
      .not('telegram_id', 'is', null)
      .order('created_at', { ascending: true })
      .limit(1)
      .single();

    if (adminError || !adminEmployee?.telegram_id) {
      return NextResponse.json(
        { error: 'No employee with Telegram ID found. Please link your Telegram account first.' },
        { status: 400 }
      );
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
          chat_id: adminEmployee.telegram_id,
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
      message: `Test reminder sent to ${adminEmployee.full_name}`,
    });
  } catch (error) {
    console.error('Error sending test reminder:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
