import { PostMedia } from '@/lib/types';
import {
  enrichPostWithTokens,
  extractSuggestions,
  getTotalRepliesCount,
} from '@/lib/utils';
import {
  GET_MENTIONS,
  GET_REPOSTS,
  GET_USER,
  getBookmarksWithBlockFilter,
  getLikesWithBlockFilter,
  getPostReplies,
  getPrivacyFilter,
} from '@/server/constants';
import { PostStatus, Prisma } from '@prisma/client';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '../trpc';

export const searchRouter = createTRPCRouter({
  trackSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { query } = input;
      const { db } = ctx;

      try {
        await db.searchQuery.upsert({
          where: { query: query.trim() },
          update: {
            count: { increment: 1 },
            updatedAt: new Date(),
          },
          create: {
            query: query.trim(),
            count: 1,
          },
        });
        return { success: true };
      } catch (error) {
        console.error('Failed to track search query:', error);
        return { success: false };
      }
    }),

  getSearchSuggestions: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().optional().default(8),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { query, limit } = input;
        const { userId, db } = ctx;

        const existingSearches = await db.searchQuery.findMany({
          where: {
            query: {
              contains: query,
              mode: 'insensitive',
            },
          },
          orderBy: [{ count: 'desc' }, { updatedAt: 'desc' }],
          take: limit,
          select: {
            query: true,
          },
        });

        let suggestions = existingSearches.map((s) => s.query);

        if (suggestions.length < limit) {
          const remainingCount = limit - suggestions.length;
          const whereClause: Prisma.PostWhereInput = {
            AND: [
              {
                text: {
                  contains: query,
                  mode: 'insensitive',
                },
              },
              { privacy: 'ANYONE' },
              { status: PostStatus.VISIBLE },
              { author: { deactivated: false } },
              getPrivacyFilter(userId!),
              { parentPostId: null },
            ],
          };

          const postTexts = await db.post.findMany({
            where: whereClause,
            orderBy: [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }],
            take: remainingCount,
            select: {
              text: true,
              id: true,
            },
          });

          const uniqueTexts = Array.from(
            new Map(postTexts.map((p) => [p.id, p.text])).values(),
          );

          const extractedSuggestions = extractSuggestions(
            uniqueTexts.filter((text) => !!text) as string[],
            query,
            remainingCount,
          );

          suggestions = [
            ...suggestions,
            ...extractedSuggestions.filter(
              (suggestion) =>
                !suggestions.some(
                  (s) => s.toLowerCase() === suggestion.toLowerCase(),
                ),
            ),
          ];

          suggestions = Array.from(new Set(suggestions)).slice(0, limit);
        }

        return suggestions;
      } catch (error) {
        console.error('Search suggestions error:', error);
        return [];
      }
    }),

  getSearchResults: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        const { query } = input;
        const { db } = ctx;

        const users = await db.user.findMany({
          where: {
            deactivated: false,
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { fullName: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            username: true,
            fullName: true,
            image: true,
          },
          take: 3,
        });

        return users;
      } catch (error) {
        console.error('Search query error:', error);
        throw new Error('Failed to perform search');
      }
    }),

  getTopResults: privateProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      }),
    )
    .query(async ({ input: { query, limit = 21, cursor }, ctx }) => {
      const { userId, db } = ctx;

      const whereClause: Prisma.PostWhereInput = {
        AND: [
          getPrivacyFilter(userId),
          {
            parentPostId: null,
          },
          { status: PostStatus.VISIBLE },
          {
            hiddenBy: {
              none: {
                userId,
              },
            },
          },
          {
            author: {
              deactivated: false,
              mutedByUsers: {
                none: {
                  mutedByUserId: userId,
                },
              },
              blockedByUsers: {
                none: {
                  blockingUserId: userId,
                },
              },
              blockedUsers: {
                none: {
                  blockedUserId: userId,
                },
              },
            },
          },
          {
            privacy: 'ANYONE',
          },
          {
            OR: [
              { text: { contains: query, mode: 'insensitive' } },
              {
                hashtags: {
                  some: { name: { contains: query, mode: 'insensitive' } },
                },
              },
            ],
          },
        ],
      };
      const posts = await db.post.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [
          { likes: { _count: 'desc' } },
          { replies: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          createdAt: true,
          text: true,
          media: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          pinned: true,
          privacy: true,
          repliesCount: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...getLikesWithBlockFilter(userId),
          ...getBookmarksWithBlockFilter(userId),
          ...getPostReplies(userId),
          ...GET_MENTIONS,
          reposts: {
            ...GET_REPOSTS,
            where: {
              user: {
                blockedByUsers: {
                  none: {
                    blockingUserId: {
                      equals: userId,
                    },
                  },
                },
                blockedUsers: {
                  none: {
                    blockedUserId: {
                      equals: userId,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      const formattedPosts = await Promise.all(
        posts.map(async (post) => {
          const postWithTokens = await enrichPostWithTokens(post);
          return {
            ...postWithTokens,
            likesCount: post.likes.length,
            repostsCount: post.reposts.length,
            repliesCount: getTotalRepliesCount(post) as number,
            bookmarksCount: new Set(
              post.bookmarks.map((bookmark) => bookmark.userId),
            ).size,
          };
        }),
      );

      let nextCursor: typeof cursor | undefined;
      if (formattedPosts.length > limit) {
        const nextItem = formattedPosts[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        formattedPosts.length = limit;
      }

      return {
        posts: formattedPosts,
        nextCursor,
      };
    }),

  getUserResults: privateProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      }),
    )
    .query(async ({ input: { query, limit = 20, cursor }, ctx }) => {
      const { userId, db } = ctx;

      const users = await db.user.findMany({
        where: {
          AND: [
            {
              deactivated: false,
            },
            {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { fullName: { contains: query, mode: 'insensitive' } },
              ],
            },
            {
              mutedByUsers: {
                none: {
                  mutedByUserId: userId,
                },
              },
              blockedByUsers: {
                none: {
                  blockingUserId: userId,
                },
              },
              blockedUsers: {
                none: {
                  blockedUserId: userId,
                },
              },
            },
          ],
        },
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [
          { verified: 'desc' },
          { followers: { _count: 'desc' } },
          { username: 'asc' },
        ],
        select: {
          ...GET_USER,
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (users.length > limit) {
        const nextItem = users[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        users.length = limit;
      }

      return {
        users,
        nextCursor,
      };
    }),

  getVideoPosts: privateProcedure
    .input(
      z.object({
        query: z.string().min(1),
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      }),
    )
    .query(async ({ input: { query, limit = 21, cursor }, ctx }) => {
      const { userId, db } = ctx;

      const whereClause: Prisma.PostWhereInput = {
        AND: [
          getPrivacyFilter(userId),
          {
            parentPostId: null,
          },
          { status: PostStatus.VISIBLE },
          {
            hiddenBy: {
              none: {
                userId,
              },
            },
          },
          {
            author: {
              deactivated: false,
              mutedByUsers: {
                none: {
                  mutedByUserId: userId,
                },
              },
              blockedByUsers: {
                none: {
                  blockingUserId: userId,
                },
              },
              blockedUsers: {
                none: {
                  blockedUserId: userId,
                },
              },
            },
          },
          {
            privacy: 'ANYONE',
          },
          {
            OR: [
              { text: { contains: query, mode: 'insensitive' } },
              {
                hashtags: {
                  some: { name: { contains: query, mode: 'insensitive' } },
                },
              },
            ],
          },
        ],
      };
      const posts = await db.post.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [
          { likes: { _count: 'desc' } },
          { replies: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
        select: {
          id: true,
          createdAt: true,
          text: true,
          media: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          pinned: true,
          privacy: true,
          repliesCount: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...getLikesWithBlockFilter(userId),
          ...getBookmarksWithBlockFilter(userId),
          ...getPostReplies(userId),
          ...GET_MENTIONS,
          reposts: {
            ...GET_REPOSTS,
            where: {
              user: {
                blockedByUsers: {
                  none: {
                    blockingUserId: {
                      equals: userId,
                    },
                  },
                },
                blockedUsers: {
                  none: {
                    blockedUserId: {
                      equals: userId,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      const videoPosts = posts.filter((post) =>
        (post.media as PostMedia[]).some((m) => m.fileType === 'video'),
      );

      const postsWithTokens = await Promise.all(
        videoPosts.map(async (post) => {
          const postWithTokens = await enrichPostWithTokens(post);

          return {
            ...postWithTokens,
            likesCount: post.likes.length,
            repostsCount: post.reposts.length,
            repliesCount: getTotalRepliesCount(post) as number,
            bookmarksCount: new Set(
              post.bookmarks.map((bookmark) => bookmark.userId),
            ).size,
          };
        }),
      );

      let nextCursor: typeof cursor | undefined;
      if (postsWithTokens.length > limit) {
        const nextItem = postsWithTokens[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        postsWithTokens.length = limit;
      }

      return {
        posts: postsWithTokens,
        nextCursor,
      };
    }),
});
