import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getLegalEntityById, updateLegalEntity } from '@/lib/db';

// GET /api/legal-entities/[id] - Get a single legal entity
export const GET = withAuth(async (
  request: NextRequest,
  { params }
) => {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Entity ID required' }, { status: 400 });
    }

    const entity = await getLegalEntityById(id);

    if (!entity) {
      return NextResponse.json({ error: 'Legal entity not found' }, { status: 404 });
    }

    return NextResponse.json({ entity });
  } catch (error) {
    console.error('Error fetching legal entity:', error);
    return NextResponse.json({ error: 'Failed to fetch legal entity' }, { status: 500 });
  }
}, { permission: PERMISSIONS.BRANCHES_VIEW });

// PUT /api/legal-entities/[id] - Update a legal entity
export const PUT = withAuth(async (
  request: NextRequest,
  { params }
) => {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Entity ID required' }, { status: 400 });
    }

    const body = await request.json();

    const result = await updateLegalEntity(id, body);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ entity: result.entity });
  } catch (error) {
    console.error('Error updating legal entity:', error);
    return NextResponse.json({ error: 'Failed to update legal entity' }, { status: 500 });
  }
}, { permission: PERMISSIONS.BRANCHES_EDIT });
