import { NextResponse } from 'next/server';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/refresh-view-counts`,
      { method: 'POST' },
    );
    const data = await response.json();

    console.log('View count refresh successful:', data);

    return NextResponse.json({ ok: true, ...data });
  } catch (error) {
    console.error('Error in refresh-view-counts cron job:', error);
    return NextResponse.json(
      { ok: false, message: 'An error occurred while refreshing view counts.' },
      { status: 500 },
    );
  }
}
