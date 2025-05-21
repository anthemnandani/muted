import { PostMedia } from '@/lib/types';
import { extractSuggestions, getTotalRepliesCount } from '@/lib/utils';
import {
  GET_LINK_PREVIEW,
  GET_MENTIONS,
  GET_REPOSTS,
  GET_USER,
  getBookmarksWithBlockFilter,
  getLikesWithBlockFilter,
  getPostRepliesCount,
} from '@/server/constants';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '../trpc';

export const searchRouter = createTRPCRouter({
  trackSearch: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { query } = input;

      try {
        await ctx.db.searchQuery.upsert({
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
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { query, limit } = input;

        const existingSearches = await ctx.db.searchQuery.findMany({
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

          const postTexts = await ctx.db.post.findMany({
            where: {
              AND: [
                {
                  text: {
                    contains: query,
                    mode: 'insensitive',
                  },
                },
                { privacy: 'ANYONE' },
                { parentPostId: null },
              ],
            },
            orderBy: [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }],
            take: remainingCount,
            select: {
              text: true,
              id: true,
            },
          });

          const uniqueTexts = Array.from(
            new Map(postTexts.map((p) => [p.id, p.text])).values()
          );

          const extractedSuggestions = extractSuggestions(
            uniqueTexts.filter((text) => !!text) as string[],
            query,
            remainingCount
          );

          suggestions = [
            ...suggestions,
            ...extractedSuggestions.filter(
              (suggestion) =>
                !suggestions.some(
                  (s) => s.toLowerCase() === suggestion.toLowerCase()
                )
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
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { query } = input;

        const users = await ctx.db.user.findMany({
          where: {
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
      })
    )
    .query(async ({ input: { query, limit = 21, cursor }, ctx }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          AND: [
            {
              parentPostId: null,
            },
            {
              hiddenBy: {
                none: {
                  userId: ctx.userId,
                },
              },
            },
            {
              author: {
                mutedByUsers: {
                  none: {
                    mutedByUserId: ctx.userId,
                  },
                },
                blockedByUsers: {
                  none: {
                    blockingUserId: ctx.userId,
                  },
                },
                blockedUsers: {
                  none: {
                    blockedUserId: ctx.userId,
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
        },
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
          hideLikes: true,
          pinned: true,
          privacy: true,
          repliesCount: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...getLikesWithBlockFilter(ctx.userId),
          ...getBookmarksWithBlockFilter(ctx.userId),
          ...getPostRepliesCount(ctx.userId),
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
          reposts: {
            ...GET_REPOSTS,
            where: {
              user: {
                blockedByUsers: {
                  none: {
                    blockingUserId: {
                      equals: ctx.userId,
                    },
                  },
                },
                blockedUsers: {
                  none: {
                    blockedUserId: {
                      equals: ctx.userId,
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

      const formattedPosts = posts.map((post) => ({
        ...post,
        media: post.media as PostMedia[],
        likesCount: post.likes.length,
        repostsCount: post.reposts.length,
        repliesCount: getTotalRepliesCount(post) as number,
        bookmarksCount: new Set(
          post.bookmarks.map((bookmark) => bookmark.userId)
        ).size,
        type: 'post' as const,
      }));

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

  getTopResultsFeed: privateProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ input: { query }, ctx }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          AND: [
            {
              parentPostId: null,
            },
            {
              hiddenBy: {
                none: {
                  userId: ctx.userId,
                },
              },
            },
            {
              author: {
                mutedByUsers: {
                  none: {
                    mutedByUserId: ctx.userId,
                  },
                },
                blockedByUsers: {
                  none: {
                    blockingUserId: ctx.userId,
                  },
                },
                blockedUsers: {
                  none: {
                    blockedUserId: ctx.userId,
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
        },
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
          hideLikes: true,
          pinned: true,
          privacy: true,
          repliesCount: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...getLikesWithBlockFilter(ctx.userId),
          ...getBookmarksWithBlockFilter(ctx.userId),
          ...getPostRepliesCount(ctx.userId),
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
          reposts: {
            ...GET_REPOSTS,
            where: {
              user: {
                blockedByUsers: {
                  none: {
                    blockingUserId: {
                      equals: ctx.userId,
                    },
                  },
                },
                blockedUsers: {
                  none: {
                    blockedUserId: {
                      equals: ctx.userId,
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

      const formattedPosts = posts.map((post) => ({
        ...post,
        media: post.media as PostMedia[],
        likesCount: post.likes.length,
        repostsCount: post.reposts.length,
        repliesCount: getTotalRepliesCount(post) as number,
        bookmarksCount: new Set(
          post.bookmarks.map((bookmark) => bookmark.userId)
        ).size,
        type: 'post' as const,
      }));

      return formattedPosts;
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
      })
    )
    .query(async ({ input: { query, limit = 20, cursor }, ctx }) => {
      const users = await ctx.db.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { username: { contains: query, mode: 'insensitive' } },
                { fullName: { contains: query, mode: 'insensitive' } },
              ],
            },
            {
              mutedByUsers: {
                none: {
                  mutedByUserId: ctx.userId,
                },
              },
              blockedByUsers: {
                none: {
                  blockingUserId: ctx.userId,
                },
              },
              blockedUsers: {
                none: {
                  blockedUserId: ctx.userId,
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
      })
    )
    .query(async ({ input: { query, limit = 21, cursor }, ctx }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          AND: [
            {
              parentPostId: null,
            },
            {
              hiddenBy: {
                none: {
                  userId: ctx.userId,
                },
              },
            },
            {
              author: {
                mutedByUsers: {
                  none: {
                    mutedByUserId: ctx.userId,
                  },
                },
                blockedByUsers: {
                  none: {
                    blockingUserId: ctx.userId,
                  },
                },
                blockedUsers: {
                  none: {
                    blockedUserId: ctx.userId,
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
        },
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
          hideLikes: true,
          pinned: true,
          privacy: true,
          repliesCount: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...getLikesWithBlockFilter(ctx.userId),
          ...getBookmarksWithBlockFilter(ctx.userId),
          ...getPostRepliesCount(ctx.userId),
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
          reposts: {
            ...GET_REPOSTS,
            where: {
              user: {
                blockedByUsers: {
                  none: {
                    blockingUserId: {
                      equals: ctx.userId,
                    },
                  },
                },
                blockedUsers: {
                  none: {
                    blockedUserId: {
                      equals: ctx.userId,
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

      const formattedPosts = posts
        .map((post) => ({
          ...post,
          media: post.media as PostMedia[],
          likesCount: post.likes.length,
          repostsCount: post.reposts.length,
          repliesCount: getTotalRepliesCount(post) as number,
          bookmarksCount: new Set(
            post.bookmarks.map((bookmark) => bookmark.userId)
          ).size,
          type: 'post' as const,
        }))
        .filter((post) =>
          post.media.some((media) => media.fileType === 'video')
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

  getVideoPostsFeed: privateProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ input: { query }, ctx }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          AND: [
            {
              parentPostId: null,
            },
            {
              hiddenBy: {
                none: {
                  userId: ctx.userId,
                },
              },
            },
            {
              author: {
                mutedByUsers: {
                  none: {
                    mutedByUserId: ctx.userId,
                  },
                },
                blockedByUsers: {
                  none: {
                    blockingUserId: ctx.userId,
                  },
                },
                blockedUsers: {
                  none: {
                    blockedUserId: ctx.userId,
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
        },
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
          hideLikes: true,
          pinned: true,
          privacy: true,
          repliesCount: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...getLikesWithBlockFilter(ctx.userId),
          ...getBookmarksWithBlockFilter(ctx.userId),
          ...getPostRepliesCount(ctx.userId),
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
          reposts: {
            ...GET_REPOSTS,
            where: {
              user: {
                blockedByUsers: {
                  none: {
                    blockingUserId: {
                      equals: ctx.userId,
                    },
                  },
                },
                blockedUsers: {
                  none: {
                    blockedUserId: {
                      equals: ctx.userId,
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

      const formattedPosts = posts
        .map((post) => ({
          ...post,
          media: post.media as PostMedia[],
          likesCount: post.likes.length,
          repostsCount: post.reposts.length,
          repliesCount: getTotalRepliesCount(post) as number,
          bookmarksCount: new Set(
            post.bookmarks.map((bookmark) => bookmark.userId)
          ).size,
          type: 'post' as const,
        }))
        .filter((post) =>
          post.media.some((media) => media.fileType === 'video')
        );

      return formattedPosts;
    }),
});
