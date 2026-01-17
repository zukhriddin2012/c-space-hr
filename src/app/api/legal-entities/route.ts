import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getLegalEntities, createLegalEntity } from '@/lib/db';

// GET /api/legal-entities - List all legal entities
export const GET = withAuth(async () => {
  try {
    const entities = await getLegalEntities();
    return NextResponse.json({ entities });
  } catch (error) {
    console.error('Error fetching legal entities:', error);
    return NextResponse.json({ error: 'Failed to fetch legal entities' }, { status: 500 });
  }
}, { permission: PERMISSIONS.BRANCHES_VIEW });

// POST /api/legal-entities - Create a new legal entity
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, short_name, inn, address, bank_name, bank_account, mfo, oked, nds_code, director_name, branch_id } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const result = await createLegalEntity({
      name,
      short_name,
      inn,
      address,
      bank_name,
      bank_account,
      mfo,
      oked,
      nds_code,
      director_name,
      branch_id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ entity: result.entity }, { status: 201 });
  } catch (error) {
    console.error('Error creating legal entity:', error);
    return NextResponse.json({ error: 'Failed to create legal entity' }, { status: 500 });
  }
}, { permission: PERMISSIONS.BRANCHES_CREATE });
