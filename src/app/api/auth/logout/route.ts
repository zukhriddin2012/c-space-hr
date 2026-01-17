import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

const COOKIE_NAME = 'c-space-auth';

export async function POST() {
  try {
    const cookieStore = await cookies();

    // Delete the auth cookie by setting it with an expired date
    cookieStore.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0, // Expire immediately
      expires: new Date(0), // Set to past date
    });

    const response = NextResponse.json({ success: true });

    // Also set the cookie in the response headers as a backup
    response.cookies.set(COOKIE_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
      expires: new Date(0),
    });

    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred during logout' },
      { status: 500 }
    );
  }
}
