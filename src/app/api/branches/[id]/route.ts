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
    const {
      name, address, latitude, longitude, geofence_radius, office_ips,
      operational_status, has_night_shift, smart_lock_enabled,
      smart_lock_start_time, smart_lock_end_time, branch_class,
      description, community_manager_id
    } = body;

    const updates: {
      name?: string;
      address?: string;
      latitude?: number | null;
      longitude?: number | null;
      geofence_radius?: number;
      office_ips?: string[];
      operational_status?: 'under_construction' | 'operational' | 'rented' | 'facility_management' | 'headquarters';
      has_night_shift?: boolean;
      smart_lock_enabled?: boolean;
      smart_lock_start_time?: string | null;
      smart_lock_end_time?: string | null;
      branch_class?: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C';
      description?: string | null;
      community_manager_id?: string | null;
    } = {};

    if (name !== undefined) updates.name = name;
    if (address !== undefined) updates.address = address;
    if (latitude !== undefined) updates.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) updates.longitude = longitude ? parseFloat(longitude) : null;
    if (geofence_radius !== undefined) updates.geofence_radius = parseInt(geofence_radius);
    if (office_ips !== undefined) updates.office_ips = office_ips;
    // New configuration fields
    if (operational_status !== undefined) updates.operational_status = operational_status;
    if (has_night_shift !== undefined) updates.has_night_shift = has_night_shift;
    if (smart_lock_enabled !== undefined) updates.smart_lock_enabled = smart_lock_enabled;
    if (smart_lock_start_time !== undefined) updates.smart_lock_start_time = smart_lock_start_time || null;
    if (smart_lock_end_time !== undefined) updates.smart_lock_end_time = smart_lock_end_time || null;
    if (branch_class !== undefined) updates.branch_class = branch_class;
    if (description !== undefined) updates.description = description || null;
    if (community_manager_id !== undefined) updates.community_manager_id = community_manager_id || null;

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
