'use server';

import { FileType } from '@/generated/prisma/enums';
import { db } from '@/server/db';
import type { ThreadMetadataType } from '../types';
import { getVideoThumbnailUrl } from '../utils';
import { createThumbnailToken } from './mux.actions';

export async function getThreadMetadata(
  threadId: string,
): Promise<ThreadMetadataType | null> {
  try {
    const thread = await db.thread.findUnique({
      where: { id: threadId },
      select: {
        text: true,
        createdAt: true,
        media: true,
        author: {
          select: {
            username: true,
            fullName: true,
            image: true,
          },
        },
      },
    });

    if (!thread) return null;

    let mediaUrl: string | null = null;
    let mediaType: string | null = null;

    if (thread.media.length > 0) {
      const firstMedia = thread.media[0];
      mediaType = firstMedia.fileType;

      if (
        firstMedia.fileType === FileType.IMAGE ||
        firstMedia.fileType === FileType.GIF
      ) {
        mediaUrl = firstMedia.fileUrl ?? null;
      } else if (
        firstMedia.fileType === FileType.VIDEO &&
        firstMedia.playbackId
      ) {
        const { thumbnailToken } = await createThumbnailToken(
          firstMedia.playbackId,
        );
        if (thumbnailToken) {
          mediaUrl = getVideoThumbnailUrl(
            firstMedia.playbackId,
            thumbnailToken,
          );
        }
      }
    }

    return {
      text: thread.text || '',
      mediaUrl,
      mediaType,
      createdAt: thread.createdAt,
      author: {
        username: thread.author?.username || '',
        fullName: thread.author?.fullName || '',
        image: thread.author?.image || '',
      },
    };
  } catch (error) {
    console.error('Error fetching thread metadata:', error);
    return null;
  }
}
