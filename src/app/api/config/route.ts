import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    isTestEnv: process.env.ENABLE_DEMO_USERS === 'true',
  });
}
