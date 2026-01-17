import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getBranches, createBranch } from '@/lib/db';

// GET /api/branches - List all branches
export const GET = withAuth(async () => {
  try {
    const branches = await getBranches();
    return NextResponse.json({ branches });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json({ error: 'Failed to fetch branches' }, { status: 500 });
  }
}, { permission: PERMISSIONS.BRANCHES_VIEW });

// POST /api/branches - Create a new branch
export const POST = withAuth(async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { name, address, latitude, longitude, geofence_radius } = body;

    if (!name || !address) {
      return NextResponse.json({ error: 'Name and address are required' }, { status: 400 });
    }

    const result = await createBranch({
      name,
      address,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      geofence_radius: geofence_radius ? parseInt(geofence_radius) : 100,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ branch: result.branch }, { status: 201 });
  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json({ error: 'Failed to create branch' }, { status: 500 });
  }
}, { permission: PERMISSIONS.BRANCHES_CREATE });
