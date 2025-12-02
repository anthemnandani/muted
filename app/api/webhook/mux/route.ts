import { db } from '@/server/db';
import Mux from '@mux/mux-node';
import { PostStatus } from '@prisma/client';
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const mux = new Mux({
  tokenId: process.env.MUX_TOKEN_ID,
  tokenSecret: process.env.MUX_TOKEN_SECRET,
  webhookSecret: process.env.MUX_WEBHOOK_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const headersList = headers();

    mux.webhooks.verifySignature(
      body,
      headersList,
      process.env.MUX_WEBHOOK_SECRET
    );

    const event = mux.webhooks.unwrap(body, headersList);
    const type = event.type;

    if (type !== 'video.asset.ready' && type !== 'video.asset.errored') {
      return NextResponse.json({ message: 'ignored' });
    }

    const data = event.data as Mux.Video.Asset;
    const uploadId = data.upload_id;
    const playbackId = data.playback_ids?.[0]?.id;
    const postId = data.passthrough;

    if (!postId || !uploadId) {
      return NextResponse.json({ ignored: true });
    }

    const post = await db.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      console.log(`Post ${postId} not found yet. Telling Mux to retry.`);
      return NextResponse.json(
        { error: 'Post not created yet' },
        { status: 500 }
      );
    }

    const isSuccess = type === 'video.asset.ready';
    const newEncodingStatus = isSuccess ? 'encoded' : 'failed';

    const updatedMedia = (post.media as any[]).map((m) => {
      if (m.videoId === uploadId) {
        return {
          ...m,
          encodingStatus: newEncodingStatus,
          playbackId: isSuccess ? playbackId : null,
        };
      }
      return m;
    });

    const allReady = updatedMedia.every(
      (m) => m.fileType !== 'video' || m.encodingStatus === 'encoded'
    );

    await db.post.update({
      where: { id: postId },
      data: {
        media: updatedMedia,
        status:
          post.status === PostStatus.HIDDEN && allReady
            ? PostStatus.VISIBLE
            : post.status,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }
}
