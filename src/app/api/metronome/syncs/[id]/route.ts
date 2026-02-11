import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { PERMISSIONS } from '@/lib/permissions';
import { getMetronomeSyncById, updateMetronomeSync } from '@/lib/db';
import { UpdateSyncSchema } from '@/lib/validators/metronome';

const isValidUUID = (str: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

// PATCH /api/metronome/syncs/[id] - Update sync planning fields (AT-08)
export const PATCH = withAuth(async (request: NextRequest, { params }) => {
  try {
    const id = params?.id;

    if (!id || !isValidUUID(id)) {
      return NextResponse.json({ error: 'Invalid sync ID' }, { status: 400 });
    }

    const body = await request.json();
    const parsed = UpdateSyncSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Permission: METRONOME_RUN_MEETING or METRONOME_EDIT_ALL
    // Enforced by withAuth middleware (permissions array with requireAll: false)
    // No ownership check — sync records are organizational

    const existingSync = await getMetronomeSyncById(id);
    if (!existingSync) {
      return NextResponse.json({ error: 'Sync record not found' }, { status: 404 });
    }

    const result = await updateMetronomeSync(id, parsed.data);
    if (!result.success) {
      return NextResponse.json({ error: 'Failed to update sync' }, { status: 400 });
    }

    // Refetch updated record
    const updated = await getMetronomeSyncById(id);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    console.error('Error in PATCH /api/metronome/syncs/[id]:', error);
    return NextResponse.json({ error: 'Failed to update sync' }, { status: 500 });
  }
}, { permissions: [PERMISSIONS.METRONOME_RUN_MEETING, PERMISSIONS.METRONOME_EDIT_ALL], requireAll: false });
