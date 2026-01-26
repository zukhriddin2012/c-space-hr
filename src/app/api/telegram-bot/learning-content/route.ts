import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import {
  getBotLearningContent,
  createBotLearningContent,
  updateBotLearningContent,
  deleteBotLearningContent,
} from '@/lib/db';

// GET /api/telegram-bot/learning-content - List all learning content
export const GET = withAuth(async () => {
  try {
    const content = await getBotLearningContent();
    return NextResponse.json({ content });
  } catch (error) {
    console.error('Error fetching learning content:', error);
    return NextResponse.json({ error: 'Failed to fetch learning content' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_VIEW });

// POST /api/telegram-bot/learning-content - Create new learning content
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { type, category, title, content, quiz_options, quiz_correct_index, quiz_explanation, is_active, display_order } = body;

    if (!type || !category || !title || !content) {
      return NextResponse.json({ error: 'Type, category, title, and content are required' }, { status: 400 });
    }

    // Validate localized content structure
    if (!title.en || !title.ru || !title.uz || !content.en || !content.ru || !content.uz) {
      return NextResponse.json({ error: 'Title and content must include en, ru, and uz translations' }, { status: 400 });
    }

    const result = await createBotLearningContent({
      type,
      category,
      title,
      content,
      quiz_options: quiz_options || null,
      quiz_correct_index: quiz_correct_index ?? null,
      quiz_explanation: quiz_explanation || null,
      is_active: is_active ?? true,
      display_order: display_order ?? 0,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ content: result.content }, { status: 201 });
  } catch (error) {
    console.error('Error creating learning content:', error);
    return NextResponse.json({ error: 'Failed to create learning content' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_EDIT });

// PUT /api/telegram-bot/learning-content - Update learning content
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await updateBotLearningContent(id, updates);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ content: result.content });
  } catch (error) {
    console.error('Error updating learning content:', error);
    return NextResponse.json({ error: 'Failed to update learning content' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_EDIT });

// DELETE /api/telegram-bot/learning-content - Delete learning content
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await deleteBotLearningContent(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting learning content:', error);
    return NextResponse.json({ error: 'Failed to delete learning content' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_EDIT });
