import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { updateCandidateChecklist, getCandidateById, type ChecklistItem } from '@/lib/db';
import type { User } from '@/types';

// PUT /api/candidates/[id]/checklist - Update checklist items
export const PUT = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    const { checklist } = await request.json();

    if (!Array.isArray(checklist)) {
      return NextResponse.json({ error: 'Checklist must be an array' }, { status: 400 });
    }

    // Validate checklist items
    for (const item of checklist) {
      if (!item.id || typeof item.text !== 'string' || typeof item.completed !== 'boolean') {
        return NextResponse.json(
          { error: 'Invalid checklist item format. Each item must have id, text, and completed fields.' },
          { status: 400 }
        );
      }
    }

    const result = await updateCandidateChecklist(id, checklist as ChecklistItem[]);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // Get updated candidate
    const candidate = await getCandidateById(id);

    return NextResponse.json({
      success: true,
      candidate,
    });
  } catch (error) {
    console.error('Error updating candidate checklist:', error);
    return NextResponse.json({ error: 'Failed to update checklist' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_MANAGE });
