'use server';

import { FileType } from '@/generated/prisma/enums';
import { db } from '@/server/db';
import { getVideoThumbnailUrl } from '../utils';
import { createThumbnailToken } from './mux.actions';

export async function getPostMetadata(postId: string) {
  try {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
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

    if (!post) {
      return null;
    }

    let mediaUrl = null;
    let mediaType = null;

    if (post.media.length > 0) {
      const firstMedia = post.media[0];
      mediaType = firstMedia.fileType;
      if (firstMedia.fileType === FileType.IMAGE) {
        mediaUrl = firstMedia.fileUrl;
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
      id: post.id,
      text: post.text || '',
      mediaUrl,
      mediaType,
      author: post.author,
      createdAt: post.createdAt,
    };
  } catch (error) {
    console.error('Error fetching post metadata:', error);
    return null;
  }
}
