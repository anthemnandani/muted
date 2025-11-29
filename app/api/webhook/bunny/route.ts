import { db } from '@/server/db';
import { PostStatus } from '@prisma/client';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const videoId = payload.VideoGuid;
    const bunnyStatus = payload.Status;

    if (!videoId) return NextResponse.json({ ignored: true });

    const isSuccess = bunnyStatus === 3 || bunnyStatus === 7;
    const isFailure = bunnyStatus === 5 || bunnyStatus === 8;

    if (!isSuccess && !isFailure) {
      return NextResponse.json({ ignored: true });
    }

    const post = await db.post.findFirst({
      where: { media: { array_contains: [{ videoId }] } },
    });

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const newEncodingStatus = isSuccess ? 'encoded' : 'failed';

    const updatedMedia = (post.media as any[]).map((m) =>
      m.videoId === videoId ? { ...m, encodingStatus: newEncodingStatus } : m
    );

    const allReady = updatedMedia.every(
      (m) => m.fileType !== 'video' || m.encodingStatus === 'encoded'
    );

    await db.post.update({
      where: { id: post.id },
      data: {
        media: updatedMedia,
        status:
          post.status === PostStatus.HIDDEN && allReady
            ? PostStatus.VISIBLE
            : post.status,
      },
    });

    const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL;
    if (SOCKET_SERVER_URL) {
      axios
        .post(`${SOCKET_SERVER_URL}/api/video-processed`, {
          userId: post.authorId,
          postId: post.id,
          status: newEncodingStatus,
          videoId,
        })
        .catch((err) => {
          console.error('Failed to notify socket server:', err.message);
        });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
