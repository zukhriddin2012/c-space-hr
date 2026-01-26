import { NextRequest, NextResponse } from 'next/server';

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Access-Control-Max-Age': '86400',
};

export async function OPTIONS() {
  console.log('[TestMethod] OPTIONS request');
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function GET(request: NextRequest) {
  console.log('[TestMethod] GET request');
  return NextResponse.json({
    method: 'GET',
    url: request.url,
    headers: Object.fromEntries(request.headers.entries()),
  }, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  console.log('[TestMethod] POST request');
  try {
    const body = await request.json();
    return NextResponse.json({
      method: 'POST',
      url: request.url,
      body,
      headers: Object.fromEntries(request.headers.entries()),
    }, { headers: corsHeaders });
  } catch (e) {
    return NextResponse.json({
      method: 'POST',
      error: 'Failed to parse body',
      url: request.url,
    }, { headers: corsHeaders });
  }
}
