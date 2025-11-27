import { PostMedia } from '@/lib/types';
import { db } from '@/server/db';
import { PostStatus } from '@prisma/client';
import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const videoId = payload.VideoGuid;
    const statusCode = payload.Status;

    if (!videoId) return NextResponse.json({ ignored: true });

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
      select: { id: true, media: true, authorId: true, status: true },
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

    const allVideosReady = updatedMedia.every((item) => {
      if (item.fileType === 'video') {
        return (
          item.encodingStatus === 'encoded' || item.encodingStatus === 'failed'
        );
      }
      return true;
    });

    let newPostStatus = post.status;
    if (post.status === PostStatus.HIDDEN && allVideosReady) {
      newPostStatus = PostStatus.VISIBLE;
    }

    await db.post.update({
      where: { id: post.id },
      data: {
        media: updatedMedia,
        status: newPostStatus,
      },
    });

    const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL;

    axios
      .post(`${SOCKET_SERVER_URL}/api/video-processed`, {
        userId: post.authorId,
        postId: post.id,
        status: newStatus,
        videoId: videoId,
      })
      .catch((err) => {
        console.error('Failed to notify socket server:', err.message);
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
