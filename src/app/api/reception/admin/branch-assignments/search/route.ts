import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api-auth';
import { searchEmployeesForAssignment } from '@/lib/db/operator-switch';

async function handler(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');

    if (!q || q.length < 2) {
      return NextResponse.json({ employees: [] });
    }

    const employees = await searchEmployeesForAssignment(q);

    return NextResponse.json({ employees });
  } catch (error) {
    console.error('Assignment employee search error:', error);
    return NextResponse.json(
      { error: 'internal_server_error' },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler, { roles: ['general_manager'] });
