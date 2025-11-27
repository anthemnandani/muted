import { PostMedia } from '@/lib/types';
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

    let newEncodingStatus: 'processing' | 'encoded' | 'failed' = 'processing';

    if (bunnyStatus === 3 || bunnyStatus === 7) {
      newEncodingStatus = 'encoded';
    } else if (bunnyStatus === 5 || bunnyStatus === 8) {
      newEncodingStatus = 'failed';
    } else {
      return NextResponse.json({ ignored: true });
    }

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
        return { ...item, encodingStatus: newEncodingStatus };
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
        status: newEncodingStatus,
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
