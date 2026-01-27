import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBAPP_URL = process.env.NEXT_PUBLIC_WEBAPP_URL || 'https://c-space-hr.vercel.app';

export async function GET(request: NextRequest) {
  if (!BOT_TOKEN) {
    return NextResponse.json({ success: false, error: 'BOT_TOKEN not configured' }, { status: 500 });
  }

  const webhookUrl = `${WEBAPP_URL}/api/telegram-bot/webhook`;

  try {
    // Set the webhook
    const setResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message', 'callback_query'],
      }),
    });

    const setResult = await setResponse.json();

    // Get webhook info to verify
    const infoResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getWebhookInfo`);
    const infoResult = await infoResponse.json();

    return NextResponse.json({
      success: setResult.ok,
      setWebhook: setResult,
      webhookInfo: infoResult.result,
      webhookUrl,
    });
  } catch (error) {
    console.error('Failed to setup webhook:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
