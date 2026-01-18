import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { supabaseAdmin, isSupabaseAdminConfigured } from '@/lib/supabase';

// GET /api/notifications/pending - Get pending counts for notifications
export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only managers/CEOs need to see pending approvals
    const canSeeApprovals = ['general_manager', 'ceo', 'hr'].includes(user.role);

    if (!canSeeApprovals || !isSupabaseAdminConfigured()) {
      return NextResponse.json({
        pendingPayments: 0,
        pendingLeaves: 0,
        total: 0,
      });
    }

    // Get pending payment requests count
    const { count: pendingPayments } = await supabaseAdmin!
      .from('payment_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending_approval');

    // Get pending leave requests count
    const { count: pendingLeaves } = await supabaseAdmin!
      .from('leave_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    const payments = pendingPayments || 0;
    const leaves = pendingLeaves || 0;

    return NextResponse.json({
      pendingPayments: payments,
      pendingLeaves: leaves,
      total: payments + leaves,
    });
  } catch (error) {
    console.error('Error fetching pending notifications:', error);
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
  }
}
