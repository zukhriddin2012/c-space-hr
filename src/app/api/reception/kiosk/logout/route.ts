import { NextResponse } from 'next/server';

// POST /api/reception/kiosk/logout — Clear kiosk session
export async function POST() {
  const response = NextResponse.json({ success: true });

  response.cookies.set('reception-kiosk', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  });

  return response;
}
