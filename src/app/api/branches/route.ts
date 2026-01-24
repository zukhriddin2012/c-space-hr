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
    const {
      name, address, latitude, longitude, geofence_radius,
      operational_status, has_night_shift, smart_lock_enabled,
      smart_lock_start_time, smart_lock_end_time, branch_class,
      description, community_manager_id
    } = body;

    if (!name || !address) {
      return NextResponse.json({ error: 'Name and address are required' }, { status: 400 });
    }

    const result = await createBranch({
      name,
      address,
      latitude: latitude ? parseFloat(latitude) : undefined,
      longitude: longitude ? parseFloat(longitude) : undefined,
      geofence_radius: geofence_radius ? parseInt(geofence_radius) : 100,
      // New configuration fields
      operational_status: operational_status || 'operational',
      has_night_shift: has_night_shift || false,
      smart_lock_enabled: smart_lock_enabled || false,
      smart_lock_start_time: smart_lock_start_time || '18:00',
      smart_lock_end_time: smart_lock_end_time || '09:00',
      branch_class: branch_class || 'B',
      description: description || null,
      community_manager_id: community_manager_id || null,
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
