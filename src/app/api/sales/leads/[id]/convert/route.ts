import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { convertLeadToClient } from '@/lib/db';
import { ConvertLeadSchema } from '@/lib/validators/sales';
import type { User } from '@/types';

// POST /api/sales/leads/[id]/convert — Convert a won lead into a client
export const POST = withAuth(
  async (request: NextRequest, { user, params }: { user: User; params?: Record<string, string> }) => {
    try {
      const id = params?.id;
      if (!id) {
        return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
      }

      const body = await request.json();
      const parsed = ConvertLeadSchema.safeParse(body);

      if (!parsed.success) {
        return NextResponse.json(
          { error: 'Validation failed', details: parsed.error.issues },
          { status: 400 }
        );
      }

      const result = await convertLeadToClient(
        id,
        parsed.data,
        user.employeeId ?? user.id
      );

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        client: result.client,
        isExisting: result.isExisting,
        lead: result.lead,
      });
    } catch (error) {
      console.error('Error in POST /api/sales/leads/[id]/convert:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  },
  { permission: PERMISSIONS.SALES_EDIT }
);
