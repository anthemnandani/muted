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
import type { PostMedia, ProfileFilter } from '../types';

export const getPostNavigationData = async ({
  username,
  sortBy,
}: {
  username: string;
  sortBy: ProfileFilter;
}) => {
  try {
    const user = await db.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const posts = await db.post.findMany({
      where: { authorId: user.id },
      orderBy:
        sortBy === 'LATEST'
          ? [{ pinned: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]
          : [{ createdAt: 'asc' }, { id: 'asc' }],
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
      },
    });

    return posts.map((post) => ({
      ...post,
      media: post.media as PostMedia[],
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

export const getLikedPosts = async (username: string) => {
  try {
    const user = await db.user.findUnique({
      where: {
        username,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const likedPosts = await db.like.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
      select: {
        post: {
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
          },
        },
      },
    });

    return likedPosts.map((likedPost) => ({
      ...likedPost.post,
      media: likedPost.post.media as PostMedia[],

      likesCount: likedPost.post._count.likes,
      repostsCount: likedPost.post._count.reposts,
      bookmarksCount: new Set(
        likedPost.post.bookmarks.map((bookmark) => bookmark.userId)
      ).size,
      type: 'post' as const,
    }));
  } catch (error) {
    console.error(error);
    throw new Error('Failed to fetch liked posts');
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
      },
    });

    if (!post) {
      throw new Error('Post not found');
    }

    return {
      ...post,
      media: post.media as PostMedia[],
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
