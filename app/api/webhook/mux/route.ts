import { EncodingStatus, FileType, PostStatus } from '@/generated/prisma/enums';
import { db } from '@/server/db';
import Mux from '@mux/mux-node';
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
      process.env.MUX_WEBHOOK_SECRET,
    );

    const event = mux.webhooks.unwrap(body, headersList);
    const type = event.type;

    if (type !== 'video.asset.ready' && type !== 'video.asset.errored') {
      return NextResponse.json({ message: 'ignored' });
    }

    const data = event.data as Mux.Video.Asset;
    const uploadId = data.upload_id;
    const playbackId = data.playback_ids?.[0]?.id;
    const passthroughRaw = data.passthrough;

    if (!passthroughRaw || !uploadId) {
      return NextResponse.json({ ignored: true });
    }

    const [entityType, entityId] = passthroughRaw.split('|');

    const isSuccess = type === 'video.asset.ready';
    const newEncodingStatus = isSuccess
      ? EncodingStatus.ENCODED
      : EncodingStatus.FAILED;

    if (entityType === 'post') {
      await db.$transaction(async (tx) => {
        await tx.media.updateMany({
          where: {
            postId: entityId,
            videoId: uploadId,
          },
          data: {
            encodingStatus: newEncodingStatus,
            playbackId: isSuccess ? playbackId : null,
          },
        });

        const allMedia = await tx.media.findMany({
          where: { postId: entityId },
        });

        const allReady =
          allMedia.length > 0 &&
          allMedia.every(
            (m) =>
              m.fileType !== FileType.VIDEO ||
              m.encodingStatus === EncodingStatus.ENCODED,
          );

        if (allReady) {
          await tx.post.update({
            where: { id: entityId },
            data: { status: PostStatus.VISIBLE },
          });
        }
      });
    } else if (entityType === 'thread') {
      await db.media.updateMany({
        where: { videoId: uploadId, threadId: entityId },
        data: {
          encodingStatus: newEncodingStatus,
          playbackId: isSuccess ? playbackId : null,
        },
      });

      if (isSuccess) {
        await db.thread.update({
          where: { id: entityId },
          data: { status: PostStatus.VISIBLE },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Webhook Error:', error.message);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 },
    );
  }
}
