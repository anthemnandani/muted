import { db } from '@/server/db';
import { NextResponse } from 'next/server';

const CRON_SECRET = process.env.CRON_SECRET;

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await db.user.deleteMany({
      where: {
        deactivated: true,
        deactivatedAt: {
          lt: thirtyDaysAgo,
        },
      },
    });

    console.log(`Cron job successful: Deleted ${result.count} inactive users.`);

    return NextResponse.json({
      ok: true,
      message: `Successfully deleted ${result.count} inactive users.`,
    });
  } catch (error) {
    console.error('Error in cron job:', error);
    return NextResponse.json(
      {
        ok: false,
        message: 'An error occurred while deleting inactive users.',
      },
      { status: 500 }
    );
  }
}
