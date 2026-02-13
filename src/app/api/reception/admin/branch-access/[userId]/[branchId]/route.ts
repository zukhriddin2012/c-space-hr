import { NextRequest, NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { supabaseAdmin } from '@/lib/supabase';

// DELETE /api/reception/admin/branch-access/[userId]/[branchId]
// Revoke branch access from a user
export const DELETE = withAuth(async (request: NextRequest, { user, params }) => {
  try {
    const userId = params?.userId;
    const branchId = params?.branchId;

    if (!userId || !branchId) {
      return NextResponse.json({ error: 'userId and branchId are required' }, { status: 400 });
    }

    // CSN-028/SEC-028 S-3: Access enforced by withAuth({ roles: ['general_manager'] }).
    // Internal role checks removed — only GM can reach this handler.

    // Check if the access grant exists
    const { data: existing, error: checkError } = await supabaseAdmin!
      .from('reception_branch_access')
      .select('id')
      .eq('user_id', userId)
      .eq('branch_id', branchId)
      .single();

    if (checkError || !existing) {
      return NextResponse.json({ error: 'Access grant not found' }, { status: 404 });
    }

    // Delete the access grant
    const { error } = await supabaseAdmin!
      .from('reception_branch_access')
      .delete()
      .eq('user_id', userId)
      .eq('branch_id', branchId);

    if (error) {
      console.error('Error revoking branch access:', error);
      return NextResponse.json({ error: 'Failed to revoke access' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in DELETE /api/reception/admin/branch-access:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}, // CSN-028/SEC-028 S-4: allowKiosk removed — kiosk users cannot access admin routes
{ roles: ['general_manager'] });
