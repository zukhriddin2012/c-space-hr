import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import {
  getBotButtonLabels,
  createBotButtonLabel,
  updateBotButtonLabel,
  deleteBotButtonLabel,
} from '@/lib/db';

// GET /api/telegram-bot/button-labels - List all button labels
export const GET = withAuth(async () => {
  try {
    const labels = await getBotButtonLabels();
    return NextResponse.json({ labels });
  } catch (error) {
    console.error('Error fetching button labels:', error);
    return NextResponse.json({ error: 'Failed to fetch button labels' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_VIEW });

// POST /api/telegram-bot/button-labels - Create new button label
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { key, description, label, emoji, is_active } = body;

    if (!key || !description || !label) {
      return NextResponse.json({ error: 'Key, description, and label are required' }, { status: 400 });
    }

    // Validate localized label structure
    if (!label.en || !label.ru || !label.uz) {
      return NextResponse.json({ error: 'Label must include en, ru, and uz translations' }, { status: 400 });
    }

    const result = await createBotButtonLabel({
      key,
      description,
      label,
      emoji: emoji || null,
      is_active: is_active ?? true,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ label: result.label }, { status: 201 });
  } catch (error) {
    console.error('Error creating button label:', error);
    return NextResponse.json({ error: 'Failed to create button label' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_EDIT });

// PUT /api/telegram-bot/button-labels - Update button label
export const PUT = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await updateBotButtonLabel(id, updates);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ label: result.label });
  } catch (error) {
    console.error('Error updating button label:', error);
    return NextResponse.json({ error: 'Failed to update button label' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_EDIT });

// DELETE /api/telegram-bot/button-labels - Delete button label
export const DELETE = withAuth(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const result = await deleteBotButtonLabel(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting button label:', error);
    return NextResponse.json({ error: 'Failed to delete button label' }, { status: 500 });
  }
}, { permission: PERMISSIONS.TELEGRAM_BOT_EDIT });
