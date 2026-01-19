import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { updateCandidateStage, type CandidateStage } from '@/lib/db';
import type { User } from '@/types';

const VALID_STAGES: CandidateStage[] = [
  'screening',
  'interview_1',
  'interview_2',
  'under_review',
  'probation',
  'hired',
  'rejected'
];

// PUT /api/candidates/[id]/stage - Change candidate stage
export const PUT = withAuth(async (request: NextRequest, context: { user: User; params?: Record<string, string> }) => {
  try {
    const id = context.params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Candidate ID is required' }, { status: 400 });
    }

    const { stage } = await request.json();

    if (!stage || !VALID_STAGES.includes(stage)) {
      return NextResponse.json(
        { error: 'Invalid stage. Valid stages: ' + VALID_STAGES.join(', ') },
        { status: 400 }
      );
    }

    const result = await updateCandidateStage(id, stage);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      candidate: result.candidate,
    });
  } catch (error) {
    console.error('Error updating candidate stage:', error);
    return NextResponse.json({ error: 'Failed to update candidate stage' }, { status: 500 });
  }
}, { permission: PERMISSIONS.RECRUITMENT_MANAGE });
