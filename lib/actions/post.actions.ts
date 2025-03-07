'use server';

import {
  GET_BOOKMARKS,
  GET_COUNT,
  GET_LIKES,
  GET_LINK_PREVIEW,
  GET_MENTIONS,
  GET_REPOSTS,
  GET_USER,
} from '@/server/constants';
import { db } from '@/server/db';
import { PostMedia } from '../types';

export const getPostNavigationData = async (username: string) => {
  try {
    const user = await db.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const posts = await db.post.findMany({
      where: { authorId: user.id },
      orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        createdAt: true,
        text: true,
        media: true,
        parentPostId: true,
        quoteId: true,
        path: true,
        repliesCount: true,
        hideLikes: true,
        pinned: true,
        privacy: true,
        author: {
          select: {
            ...GET_USER,
          },
        },
        ...GET_LIKES,
        ...GET_BOOKMARKS,
        ...GET_COUNT,
        ...GET_REPOSTS,
        ...GET_MENTIONS,
        ...GET_LINK_PREVIEW,
        reposts: {
          select: {
            createdAt: true,
            user: {
              select: {
                ...GET_USER,
              },
            },
            post: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    return posts.map((post) => ({
      ...post,
      media: post.media as PostMedia[],
      reposts: post.reposts.map((repost) => ({
        userId: repost.user.id,
        postId: repost.post.id,
      })),
      likesCount: post._count.likes,
      repostsCount: post._count.reposts,
      bookmarksCount: new Set(post.bookmarks.map((bookmark) => bookmark.userId))
        .size,
      type: 'post' as const,
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch navigation data');
  }
};

export const getPostById = async (id: string) => {
  try {
    const post = await db.post.findUnique({
      where: { id },
      select: {
        id: true,
        createdAt: true,
        text: true,
        media: true,
        parentPostId: true,
        quoteId: true,
        path: true,
        repliesCount: true,
        hideLikes: true,
        pinned: true,
        privacy: true,
        author: {
          select: {
            ...GET_USER,
          },
        },
        ...GET_LIKES,
        ...GET_BOOKMARKS,
        ...GET_COUNT,
        ...GET_REPOSTS,
        ...GET_MENTIONS,
        ...GET_LINK_PREVIEW,
        reposts: {
          select: {
            createdAt: true,
            user: {
              select: {
                ...GET_USER,
              },
            },
            post: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    return {
      ...post,
      media: post.media as PostMedia[],
      reposts: post.reposts.map((repost) => ({
        userId: repost.user.id,
        postId: repost.post.id,
      })),
      likesCount: post._count.likes,
      repostsCount: post._count.reposts,
      bookmarksCount: new Set(post.bookmarks.map((bookmark) => bookmark.userId))
        .size,
      type: 'post' as const,
    };
  } catch (error) {
    console.error(error);
    throw new Error('Post not found');
  }
};
