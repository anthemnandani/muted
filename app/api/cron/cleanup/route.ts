import { NextResponse } from 'next/server';
import { db } from '@/server/db';
import { PostStatus, EncodingStatus } from '@/generated/prisma/enums';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const deletedPosts = await db.post.deleteMany({
      where: {
        status: PostStatus.HIDDEN,
        createdAt: {
          lt: twoHoursAgo,
        },
        media: {
          some: {
            encodingStatus: EncodingStatus.PROCESSING,
          },
        },
      },
    });

    const deletedThreads = await db.thread.deleteMany({
      where: {
        status: PostStatus.HIDDEN,
        createdAt: {
          lt: twoHoursAgo,
        },
        media: {
          some: {
            encodingStatus: EncodingStatus.PROCESSING,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${deletedPosts.count} posts and ${deletedThreads.count} threads.`,
    });
  } catch (error: any) {
    console.error('Cron Cleanup Error:', error.message);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
