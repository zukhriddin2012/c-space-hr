import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth-server';
import { getGrowthKeyDates, getLatestGrowthSync } from '@/lib/db';

// GET /api/growth/public - Get public company updates (available to all employees)
export async function GET() {
  const user = await getSession();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Fetch public data - key dates and basic sync info
    const [keyDates, latestSync] = await Promise.all([
      getGrowthKeyDates(),
      getLatestGrowthSync(),
    ]);

    // Filter to only upcoming dates (from today onwards)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingDates = keyDates.filter(date => {
      const dateObj = new Date(date.date);
      return dateObj >= today;
    }).slice(0, 10); // Limit to 10 upcoming dates

    return NextResponse.json({
      keyDates: upcomingDates,
      syncInfo: latestSync ? {
        last_sync_date: latestSync.sync_date,
        next_sync_date: latestSync.next_sync_date,
      } : null,
    });
  } catch (error) {
    console.error('Error fetching public company updates:', error);
    return NextResponse.json({ error: 'Failed to fetch company updates' }, { status: 500 });
  }
}
