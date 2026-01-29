import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getDashboardStats } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const branchId = searchParams.get('branchId');

    if (!branchId) {
      return NextResponse.json(
        { error: 'branchId is required' },
        { status: 400 }
      );
    }

    // Check if user has access to this branch
    if (user.role === 'branch_manager' && user.branchId !== branchId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Default to current month
    const now = new Date();
    const startDate = searchParams.get('startDate') ||
      new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
    const endDate = searchParams.get('endDate') ||
      new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];

    const stats = await getDashboardStats(branchId, startDate, endDate);

    return NextResponse.json({
      stats,
      period: { startDate, endDate },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}
