import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import {
  getBotMessageTemplates,
  createBotMessageTemplate,
  updateBotMessageTemplate,
  deleteBotMessageTemplate,
} from '@/lib/db';

// GET /api/telegram-bot/message-templates - List all message templates
export const GET = withAuth(async () => {
  try {
    const templates = await getBotMessageTemplates();
    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching message templates:', error);
    return NextResponse.json({ error: 'Failed to fetch message templates' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_VIEW });

// POST /api/telegram-bot/message-templates - Create new message template
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { key, description, content, available_placeholders, is_active } = body;

    if (!key || !description || !content) {
      return NextResponse.json({ error: 'Key, description, and content are required' }, { status: 400 });
    }

    // Validate localized content structure
    if (!content.en || !content.ru || !content.uz) {
      return NextResponse.json({ error: 'Content must include en, ru, and uz translations' }, { status: 400 });
    }

    const result = await createBotMessageTemplate({
      key,
      description,
      content,
      available_placeholders: available_placeholders || [],
      is_active: is_active ?? true,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ template: result.template }, { status: 201 });
  } catch (error) {
    console.error('Error creating message template:', error);
    return NextResponse.json({ error: 'Failed to create message template' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_EDIT });

// PUT /api/telegram-bot/message-templates - Update message template
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await updateBotMessageTemplate(id, updates);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ template: result.template });
  } catch (error) {
    console.error('Error updating message template:', error);
    return NextResponse.json({ error: 'Failed to update message template' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_EDIT });

// DELETE /api/telegram-bot/message-templates - Delete message template
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await deleteBotMessageTemplate(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting message template:', error);
    return NextResponse.json({ error: 'Failed to delete message template' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_EDIT });
