'use server';

import { db } from '@/server/db';
import { PostMedia } from '../types';

export async function getPostMetadata(postId: string) {
  try {
    const post = await db.post.findUnique({
      where: { id: postId },
      include: {
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

    const postData = { ...post, media: post.media as PostMedia[] };

    let mediaUrl = null;
    let mediaType = null;

    if (postData.media.length > 0) {
      const firstMedia = postData.media[0];
      mediaType = firstMedia.fileType;
      if (firstMedia.fileType === 'image') {
        mediaUrl = firstMedia.fileUrl;
      } else if (firstMedia.fileType === 'video') {
        mediaUrl = firstMedia.thumbnailUrl;
      }
    }

    return {
      id: post.id,
      text: post.text || post.threadText || '',
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
