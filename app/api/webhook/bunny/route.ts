import { PostMedia } from '@/lib/types';
import { db } from '@/server/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const videoId = payload.VideoGuid;
    const statusCode = payload.Status;

    if (!videoId) return NextResponse.json({ ignored: true });

    console.log(statusCode);
    console.log(videoId);

    let newStatus = 'processing';
    if (statusCode === 3 || statusCode === 4) newStatus = 'encoded';
    if (statusCode === 5 || statusCode === 6) newStatus = 'failed';

    if (newStatus === 'processing') return NextResponse.json({ success: true });

    const post = await db.post.findFirst({
      where: {
        media: {
          array_contains: [{ videoId }],
        },
      },
    });

    if (!post || !Array.isArray(post.media)) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const currentMedia = post.media as PostMedia[];
    const updatedMedia = currentMedia.map((item) => {
      if (item.videoId === videoId) {
        return { ...item, encodingStatus: newStatus };
      }
      return item;
    });

    await db.post.update({
      where: { id: post.id },
      data: {
        media: updatedMedia,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
