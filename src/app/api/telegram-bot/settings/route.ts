import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getBotSettings, upsertBotSetting } from '@/lib/db';

// GET /api/telegram-bot/settings - Get all bot settings
export const GET = withAuth(async () => {
  try {
    const settings = await getBotSettings();
    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching bot settings:', error);
    return NextResponse.json({ error: 'Failed to fetch bot settings' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_VIEW });

// PUT /api/telegram-bot/settings - Update bot setting
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { key, value, description } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value are required' }, { status: 400 });
    }

    const result = await upsertBotSetting(key, value, description);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ setting: result.setting });
  } catch (error) {
    console.error('Error updating bot setting:', error);
    return NextResponse.json({ error: 'Failed to update bot setting' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_EDIT });
