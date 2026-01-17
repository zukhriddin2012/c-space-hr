import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getBranchById, updateBranch, deleteBranch } from '@/lib/db';

// GET /api/branches/[id] - Get a single branch
export const GET = withAuth(async (
  request: NextRequest,
  { params }
) => {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });
    }

    const branch = await getBranchById(id);

    if (!branch) {
      return NextResponse.json({ error: 'Branch not found' }, { status: 404 });
    }

    return NextResponse.json({ branch });
  } catch (error) {
    console.error('Error fetching branch:', error);
    return NextResponse.json({ error: 'Failed to fetch branch' }, { status: 500 });
  }
}, { permission: PERMISSIONS.BRANCHES_VIEW });

// PUT /api/branches/[id] - Update a branch
export const PUT = withAuth(async (
  request: NextRequest,
  { params }
) => {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { name, address, latitude, longitude, geofence_radius } = body;

    const updates: {
      name?: string;
      address?: string;
      latitude?: number | null;
      longitude?: number | null;
      geofence_radius?: number;
    } = {};

    if (name !== undefined) updates.name = name;
    if (address !== undefined) updates.address = address;
    if (latitude !== undefined) updates.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updates.longitude = longitude ? parseFloat(longitude) : null;
    if (geofence_radius !== undefined) updates.geofence_radius = parseInt(geofence_radius);

    const result = await updateBranch(id, updates);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ branch: result.branch });
  } catch (error) {
    console.error('Error updating branch:', error);
    return NextResponse.json({ error: 'Failed to update branch' }, { status: 500 });
  }
}, { permission: PERMISSIONS.BRANCHES_EDIT });

// DELETE /api/branches/[id] - Delete a branch
export const DELETE = withAuth(async (
  request: NextRequest,
  { params }
) => {
  try {
    const id = params?.id;
    if (!id) {
      return NextResponse.json({ error: 'Branch ID required' }, { status: 400 });
    }

    const result = await deleteBranch(id);

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting branch:', error);
    return NextResponse.json({ error: 'Failed to delete branch' }, { status: 500 });
  }
}, { permission: PERMISSIONS.BRANCHES_DELETE });
