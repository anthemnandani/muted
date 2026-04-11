import { PostStatus, ViewTier } from '@/generated/prisma/enums';
import { PostWhereInput } from '@/generated/prisma/models';
import {
  enrichPostWithTokens,
  enrichThreadWithTokens,
  enrichThumbnailToken,
  getDateRange,
  getPreviousRange,
  toLocalDateString,
} from '@/lib/utils';
import { z } from 'zod';
import { GET_MENTIONS, GET_USER, THREAD_SELECT } from '../../constants';
import { createTRPCRouter, privateProcedure } from '../trpc';

const timeRangeInput = z.object({
  range: z.enum(['7d', '28d', '90d', 'all']).default('7d'),
});

const filterInput = z.object({
  cursor: z.string().optional(),
  sortOrder: z.enum(['newest', 'oldest']).default('newest'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
});

const mediaFilterInput = z.object({
  cursor: z.string().optional(),
  sortOrder: z.enum(['newest', 'oldest']).default('newest'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  mediaType: z.enum(['ALL', 'IMAGE', 'VIDEO']).default('ALL'),
});

const VIEW_FILTER = { tier: ViewTier.VIEW };

export const activityRouter = createTRPCRouter({
  getOverview: privateProcedure
    .input(timeRangeInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { start, end } = getDateRange(input.range);
      const prev = getPreviousRange(input.range);

      const userPosts = await ctx.db.post.findMany({
        where: { authorId: userId },
        select: { id: true },
      });
      const postIds = userPosts.map((p) => p.id);

      if (postIds.length === 0) {
        return {
          totalViews: 0,
          uniqueReach: 0,
          engagementRate: 0,
          netFollowers: 0,
          deltas: { views: 0, reach: 0, engagement: 0, followers: 0 },
        };
      }

      const [currentViews, prevViews] = await Promise.all([
        ctx.db.postView.count({
          where: {
            postId: { in: postIds },
            ...VIEW_FILTER,
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.postView.count({
          where: {
            postId: { in: postIds },
            ...VIEW_FILTER,
            createdAt: { gte: prev.start, lte: prev.end },
          },
        }),
      ]);

      const [currentReach, prevReach] = await Promise.all([
        ctx.db.postView.groupBy({
          by: ['userId'],
          where: {
            postId: { in: postIds },
            ...VIEW_FILTER,
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.postView.groupBy({
          by: ['userId'],
          where: {
            postId: { in: postIds },
            ...VIEW_FILTER,
            createdAt: { gte: prev.start, lte: prev.end },
          },
        }),
      ]);

      const [likes, comments, reposts, bookmarks] = await Promise.all([
        ctx.db.like.count({
          where: {
            postId: { in: postIds },
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.post.count({
          where: {
            parentPostId: { in: postIds },
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.repost.count({
          where: {
            postId: { in: postIds },
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.bookmark.count({
          where: {
            postId: { in: postIds },
            createdAt: { gte: start, lte: end },
          },
        }),
      ]);

      const totalEng = likes + comments + reposts + bookmarks;
      const er = currentViews > 0 ? (totalEng / currentViews) * 100 : 0;

      const followsGained = await ctx.db.follow.count({
        where: {
          followingId: userId,
          createdAt: { gte: start, lte: end },
        },
      });

      const calcDelta = (curr: number, prev: number) =>
        prev === 0 ? 0 : ((curr - prev) / prev) * 100;

      return {
        totalViews: currentViews,
        uniqueReach: currentReach.length,
        engagementRate: Math.round(er * 10) / 10,
        netFollowers: followsGained,
        deltas: {
          views: Math.round(calcDelta(currentViews, prevViews) * 10) / 10,
          reach:
            Math.round(calcDelta(currentReach.length, prevReach.length) * 10) /
            10,
          engagement: 0,
          followers: 0,
        },
      };
    }),

  getFollowerGrowth: privateProcedure
    .input(timeRangeInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { start, end } = getDateRange(input.range);

      const followersBeforePeriod = await ctx.db.follow.count({
        where: {
          followingId: userId,
          createdAt: { lt: start },
        },
      });

      const followsInPeriod = await ctx.db.follow.findMany({
        where: {
          followingId: userId,
          createdAt: { gte: start, lte: end },
        },
        select: { createdAt: true },
        orderBy: { createdAt: 'asc' },
      });

      const dailyGains = new Map<string, number>();
      const startDate = new Date(start);
      const endDate = new Date(end);

      for (
        let d = new Date(startDate);
        d <= endDate;
        d.setDate(d.getDate() + 1)
      ) {
        dailyGains.set(toLocalDateString(d), 0);
      }

      followsInPeriod.forEach((f) => {
        const day = toLocalDateString(f.createdAt);
        if (dailyGains.has(day)) {
          dailyGains.set(day, (dailyGains.get(day) || 0) + 1);
        }
      });

      let runningTotal = followersBeforePeriod;
      const snapshots = Array.from(dailyGains.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, gained]) => {
          runningTotal += gained;
          return { date, count: runningTotal };
        });

      return {
        snapshots,
        gained: followsInPeriod.length,
        lost: 0,
      };
    }),

  getEngagement: privateProcedure
    .input(timeRangeInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { start, end } = getDateRange(input.range);

      const userPosts = await ctx.db.post.findMany({
        where: { authorId: userId },
        select: { id: true },
      });
      const postIds = userPosts.map((p) => p.id);

      const [likes, comments, reposts, saves] = await Promise.all([
        ctx.db.like.count({
          where: {
            postId: { in: postIds },
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.post.count({
          where: {
            parentPostId: { in: postIds },
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.repost.count({
          where: {
            postId: { in: postIds },
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.bookmark.count({
          where: {
            postId: { in: postIds },
            createdAt: { gte: start, lte: end },
          },
        }),
      ]);

      return { likes, comments, reposts, saves };
    }),

  getPostOverview: privateProcedure
    .input(timeRangeInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { start, end } = getDateRange(input.range);
      const prev = getPreviousRange(input.range);

      const postIds = (
        await ctx.db.post.findMany({
          where: { authorId: userId, parentPostId: null },
          select: { id: true },
        })
      ).map((p) => p.id);

      if (postIds.length === 0) {
        return {
          totalViews: 0,
          engagementRate: 0,
          deltas: { views: 0 },
          dailyViews: [] as { date: string; views: number }[],
        };
      }

      const [currentViews, prevViews, viewRecords, impressionRecords] =
        await Promise.all([
          ctx.db.postView.count({
            where: {
              postId: { in: postIds },
              ...VIEW_FILTER,
              createdAt: { gte: start, lte: end },
            },
          }),
          ctx.db.postView.count({
            where: {
              postId: { in: postIds },
              ...VIEW_FILTER,
              createdAt: { gte: prev.start, lte: prev.end },
            },
          }),
          ctx.db.postView.findMany({
            where: {
              postId: { in: postIds },
              ...VIEW_FILTER,
              createdAt: { gte: start, lte: end },
            },
            select: { createdAt: true },
          }),
          ctx.db.postView.findMany({
            where: {
              postId: { in: postIds },
              tier: ViewTier.IMPRESSION,
              createdAt: { gte: start, lte: end },
            },
            select: { createdAt: true },
          }),
        ]);

      const [likes, comments, reposts, saves] = await Promise.all([
        ctx.db.like.count({
          where: {
            postId: { in: postIds },
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.post.count({
          where: {
            parentPostId: { in: postIds },
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.repost.count({
          where: {
            postId: { in: postIds },
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.bookmark.count({
          where: {
            postId: { in: postIds },
            createdAt: { gte: start, lte: end },
          },
        }),
      ]);

      const totalEng = likes + comments + reposts + saves;
      const er =
        currentViews > 0
          ? Math.round((totalEng / currentViews) * 1000) / 10
          : 0;

      // Daily views + impressions
      const dailyViewsMap = new Map<string, number>();
      const dailyImpressionsMap = new Map<string, number>();
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = toLocalDateString(d);
        dailyViewsMap.set(key, 0);
        dailyImpressionsMap.set(key, 0);
      }
      viewRecords.forEach((v) => {
        const day = toLocalDateString(v.createdAt);
        if (dailyViewsMap.has(day))
          dailyViewsMap.set(day, (dailyViewsMap.get(day) || 0) + 1);
      });
      impressionRecords.forEach((v) => {
        const day = toLocalDateString(v.createdAt);
        if (dailyImpressionsMap.has(day))
          dailyImpressionsMap.set(day, (dailyImpressionsMap.get(day) || 0) + 1);
      });

      const calcDelta = (curr: number, prev: number) =>
        prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 1000) / 10;

      const sortedDays = Array.from(dailyViewsMap.keys()).sort();

      return {
        totalViews: currentViews,
        totalImpressions: impressionRecords.length,
        engagementRate: er,
        engagement: { likes, comments, reposts, saves },
        deltas: { views: calcDelta(currentViews, prevViews) },
        dailyChart: sortedDays.map((date) => ({
          date,
          views: dailyViewsMap.get(date) || 0,
          impressions: dailyImpressionsMap.get(date) || 0,
        })),
      };
    }),

  getThreadOverview: privateProcedure
    .input(timeRangeInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { start, end } = getDateRange(input.range);
      const prev = getPreviousRange(input.range);

      const threadIds = (
        await ctx.db.thread.findMany({
          where: { authorId: userId, parentId: null },
          select: { id: true },
        })
      ).map((t) => t.id);

      if (threadIds.length === 0) {
        return {
          totalViews: 0,
          engagementRate: 0,
          deltas: { views: 0 },
          dailyViews: [] as { date: string; views: number }[],
        };
      }

      const [currentViews, prevViews, viewRecords, impressionRecords] =
        await Promise.all([
          ctx.db.postView.count({
            where: {
              threadId: { in: threadIds },
              ...VIEW_FILTER,
              createdAt: { gte: start, lte: end },
            },
          }),
          ctx.db.postView.count({
            where: {
              threadId: { in: threadIds },
              ...VIEW_FILTER,
              createdAt: { gte: prev.start, lte: prev.end },
            },
          }),
          ctx.db.postView.findMany({
            where: {
              threadId: { in: threadIds },
              ...VIEW_FILTER,
              createdAt: { gte: start, lte: end },
            },
            select: { createdAt: true },
          }),
          ctx.db.postView.findMany({
            where: {
              threadId: { in: threadIds },
              tier: 'IMPRESSION',
              createdAt: { gte: start, lte: end },
            },
            select: { createdAt: true },
          }),
        ]);

      const [likes, comments, reposts, saves] = await Promise.all([
        ctx.db.like.count({
          where: {
            threadId: { in: threadIds },
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.thread.count({
          where: {
            parentId: { in: threadIds },
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.repost.count({
          where: {
            threadId: { in: threadIds },
            createdAt: { gte: start, lte: end },
          },
        }),
        ctx.db.bookmark.count({
          where: {
            threadId: { in: threadIds },
            createdAt: { gte: start, lte: end },
          },
        }),
      ]);

      const totalEng = likes + comments + reposts + saves;
      const er =
        currentViews > 0
          ? Math.round((totalEng / currentViews) * 1000) / 10
          : 0;

      const dailyViewsMap = new Map<string, number>();
      const dailyImpressionsMap = new Map<string, number>();
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const key = toLocalDateString(d);
        dailyViewsMap.set(key, 0);
        dailyImpressionsMap.set(key, 0);
      }
      viewRecords.forEach((v) => {
        const day = toLocalDateString(v.createdAt);
        if (dailyViewsMap.has(day))
          dailyViewsMap.set(day, (dailyViewsMap.get(day) || 0) + 1);
      });
      impressionRecords.forEach((v) => {
        const day = toLocalDateString(v.createdAt);
        if (dailyImpressionsMap.has(day))
          dailyImpressionsMap.set(day, (dailyImpressionsMap.get(day) || 0) + 1);
      });

      const calcDelta = (curr: number, prev: number) =>
        prev === 0 ? 0 : Math.round(((curr - prev) / prev) * 1000) / 10;

      const sortedDays = Array.from(dailyViewsMap.keys()).sort();

      return {
        totalViews: currentViews,
        totalImpressions: impressionRecords.length,
        engagementRate: er,
        engagement: { likes, comments, reposts, saves },
        deltas: { views: calcDelta(currentViews, prevViews) },
        dailyChart: sortedDays.map((date) => ({
          date,
          views: dailyViewsMap.get(date) || 0,
          impressions: dailyImpressionsMap.get(date) || 0,
        })),
      };
    }),

  getTopPosts: privateProcedure
    .input(timeRangeInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { start, end } = getDateRange(input.range);

      const posts = await ctx.db.post.findMany({
        where: {
          authorId: userId,
          parentPostId: null,
          createdAt: { gte: start, lte: end },
        },
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: {
          id: true,
          text: true,
          createdAt: true,
          media: {
            take: 1,
            select: {
              id: true,
              fileUrl: true,
              fileType: true,
              playbackId: true,
              thumbnailToken: true,
            },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
              views: { where: { tier: ViewTier.VIEW } },
            },
          },
        },
      });

      const formattedPosts = await Promise.all(
        posts.map(async (post) => {
          const postWithTokens = await enrichPostWithTokens(post);
          return {
            ...postWithTokens,
            views: post._count.views,
            likes: post._count.likes,
            comments: post._count.replies,
          };
        }),
      );

      return formattedPosts;
    }),

  getTopThreads: privateProcedure
    .input(timeRangeInput)
    .query(async ({ ctx, input }) => {
      const userId = ctx.userId;
      const { start, end } = getDateRange(input.range);

      const threads = await ctx.db.thread.findMany({
        where: {
          authorId: userId,
          parentId: null,
          createdAt: { gte: start, lte: end },
        },
        orderBy: { viewCount: 'desc' },
        take: 10,
        select: {
          id: true,
          text: true,
          createdAt: true,
          media: {
            take: 1,
            select: { fileUrl: true, fileType: true },
          },
          _count: {
            select: {
              likes: true,
              replies: true,
              views: { where: { tier: ViewTier.VIEW } },
            },
          },
        },
      });

      return threads.map((thread) => ({
        id: thread.id,
        text: thread.text,
        createdAt: thread.createdAt,
        views: thread._count.views,
        likes: thread._count.likes,
        comments: thread._count.replies,
        hasMedia: thread.media.length > 0,
        fileType: thread.media[0]?.fileType || null,
      }));
    }),

  getUserLikedPosts: privateProcedure
    .input(filterInput)
    .query(async ({ ctx, input }) => {
      const { db, userId } = ctx;
      const { startDate, endDate, sortOrder } = input;
      const limit = 20;

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = startDate;
      if (endDate) dateFilter.lte = endDate;
      const hasDateFilter = Object.keys(dateFilter).length > 0;

      const likes = await db.like.findMany({
        where: {
          userId,
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          post: {
            AND: [
              { parentPostId: null },
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
            ],
          },
        },
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: sortOrder === 'newest' ? 'desc' : 'asc' },
        select: {
          id: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              text: true,
              createdAt: true,
              media: true,
              repliesCount: true,
              _count: { select: { likes: true } },
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (likes.length > limit) nextCursor = likes.pop()!.id;

      const formattedPosts = await Promise.all(
        likes
          .filter((l) => l.post)
          .map(async (l) => {
            const post = l.post!;
            return {
              ...post,
              media: await enrichThumbnailToken(post.media),
              likesCount: post._count.likes,
            };
          }),
      );

      return { posts: formattedPosts, nextCursor };
    }),

  getUserLikedThreads: privateProcedure
    .input(filterInput)
    .query(async ({ input, ctx }) => {
      const { userId, db } = ctx;
      const { startDate, endDate, sortOrder } = input;
      const limit = 20;

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = startDate;
      if (endDate) dateFilter.lte = endDate;
      const hasDateFilter = Object.keys(dateFilter).length > 0;

      const likes = await db.like.findMany({
        where: {
          userId,
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          threadId: { not: null },
          thread: {
            deleted: false,
            status: PostStatus.VISIBLE,
            author: {
              deactivated: false,
              mutedByUsers: { none: { mutedByUserId: userId } },
              blockedByUsers: { none: { blockingUserId: userId } },
              blockedUsers: { none: { blockedUserId: userId } },
            },
          },
        },
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: sortOrder === 'newest' ? 'desc' : 'asc' },
        select: {
          id: true,
          createdAt: true,
          thread: {
            select: THREAD_SELECT(userId),
          },
        },
      });

      let nextCursor: string | undefined;
      if (likes.length > limit) nextCursor = likes.pop()!.id;

      const formattedThreads = await Promise.all(
        likes
          .filter((l) => l.thread)
          .map(async (l) => {
            const threadWithTokens = await enrichThreadWithTokens(l.thread!);
            return {
              ...threadWithTokens,
              likesCount: l.thread!.likes.length,
              repostsCount: l.thread!.reposts.length,
              bookmarksCount: new Set(l.thread!.bookmarks.map((b) => b.userId))
                .size,
              repostedBy: null,
              repostedAt: null,
            };
          }),
      );

      return { threads: formattedThreads, nextCursor };
    }),

  getUserComments: privateProcedure
    .input(filterInput)
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx;
      const { startDate, endDate } = input;
      const limit = 20;

      const dateFilter: any = {};

      if (startDate) dateFilter.gte = startDate;
      if (endDate) dateFilter.lte = endDate;
      const hasDateFilter = Object.keys(dateFilter).length > 0;

      const comments = await db.post.findMany({
        where: {
          authorId: userId,
          parentPostId: { not: null },
          status: PostStatus.VISIBLE,
          deleted: false,
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: input.sortOrder === 'newest' ? 'desc' : 'asc' },
        select: {
          id: true,
          createdAt: true,
          text: true,
          media: true,
          parentPostId: true,
          path: true,
          ...GET_MENTIONS,
          author: { select: { ...GET_USER } },
          parentPost: {
            select: {
              id: true,
              text: true,
              path: true,
              createdAt: true,
              parentPostId: true,
              media: {
                select: {
                  fileUrl: true,
                  fileType: true,
                  thumbnailUrl: true,
                },
                take: 1,
              },
              author: {
                select: {
                  id: true,
                  username: true,
                  image: true,
                },
              },
              parentPost: {
                select: {
                  id: true,
                  text: true,
                  path: true,
                  createdAt: true,
                  media: {
                    select: {
                      fileUrl: true,
                      fileType: true,
                      thumbnailUrl: true,
                    },
                    take: 1,
                  },
                  author: {
                    select: {
                      id: true,
                      username: true,
                      image: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined = undefined;

      if (comments.length > limit) {
        nextCursor = comments.pop()?.id;
      }

      const formatted = comments.map((c) => {
        const directParent = c.parentPost;

        if (!directParent) {
          return { ...c, parentPost: null, replyToComment: null };
        }

        const isNested =
          !!directParent.parentPostId && !!directParent.parentPost;

        const rootPost = isNested ? directParent.parentPost : directParent;

        const replyToComment = isNested
          ? {
              id: directParent.id,
              text: directParent.text,
              createdAt: directParent.createdAt,
              author: directParent.author,
            }
          : null;

        return {
          ...c,
          parentPost: rootPost
            ? {
                id: rootPost?.id,
                text: rootPost?.text,
                path: rootPost?.path ?? null,
                createdAt: rootPost?.createdAt,
                media: rootPost?.media,
                author: rootPost?.author,
              }
            : null,
          replyToComment,
        };
      });

      return { comments: formatted, nextCursor };
    }),

  getUserThreadComments: privateProcedure
    .input(filterInput)
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx;
      const { startDate, endDate } = input;
      const limit = 20;

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = startDate;
      if (endDate) dateFilter.lte = endDate;
      const hasDateFilter = Object.keys(dateFilter).length > 0;

      const comments = await db.thread.findMany({
        where: {
          authorId: userId,
          parentId: { not: null },
          status: PostStatus.VISIBLE,
          deleted: false,
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: input.sortOrder === 'newest' ? 'desc' : 'asc' },
        select: {
          id: true,
          text: true,
          createdAt: true,
          parentId: true,
          repliesCount: true,
          _count: { select: { likes: true } },
          author: {
            select: { id: true, username: true, image: true },
          },
          media: {
            select: { fileUrl: true, fileType: true },
            take: 1,
          },
          parent: {
            select: {
              id: true,
              text: true,
              createdAt: true,
              parentId: true,
              author: {
                select: { id: true, username: true, image: true },
              },
              media: {
                select: { fileUrl: true, fileType: true },
                take: 1,
              },
              parent: {
                select: {
                  id: true,
                  text: true,
                  createdAt: true,
                  author: {
                    select: { id: true, username: true, image: true },
                  },
                  media: {
                    select: { fileUrl: true, fileType: true },
                    take: 1,
                  },
                },
              },
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (comments.length > limit) nextCursor = comments.pop()!.id;

      return {
        comments: comments.map((c) => ({
          ...c,
          likesCount: c._count.likes,
        })),
        nextCursor,
      };
    }),

  getUserReposts: privateProcedure
    .input(filterInput)
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx;
      const { startDate, endDate, sortOrder } = input;
      const limit = 20;

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = startDate;
      if (endDate) dateFilter.lte = endDate;
      const hasDateFilter = Object.keys(dateFilter).length > 0;

      const reposts = await db.repost.findMany({
        where: {
          userId,
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          post: {
            AND: [
              { parentPostId: null },
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
            ],
          },
        },
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: sortOrder === 'newest' ? 'desc' : 'asc' },
        select: {
          id: true,
          createdAt: true,
          post: {
            select: {
              id: true,
              text: true,
              createdAt: true,
              media: true,
              repliesCount: true,
              _count: { select: { likes: true } },
            },
          },
        },
      });

      let nextCursor: string | undefined;
      if (reposts.length > limit) nextCursor = reposts.pop()!.id;

      const formattedPosts = await Promise.all(
        reposts
          .filter((r) => r.post)
          .map(async (r) => {
            const post = r.post!;
            const postWithTokens = await enrichPostWithTokens(post);
            return {
              ...postWithTokens,
              likesCount: post._count.likes,
            };
          }),
      );

      return { posts: formattedPosts, nextCursor };
    }),

  getUserThreadReposts: privateProcedure
    .input(filterInput)
    .query(async ({ input, ctx }) => {
      const { userId, db } = ctx;
      const { startDate, endDate, sortOrder } = input;
      const limit = 20;

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = startDate;
      if (endDate) dateFilter.lte = endDate;
      const hasDateFilter = Object.keys(dateFilter).length > 0;

      const reposts = await db.repost.findMany({
        where: {
          userId,
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
          threadId: { not: null },
          thread: {
            deleted: false,
            status: PostStatus.VISIBLE,
            author: {
              deactivated: false,
              mutedByUsers: { none: { mutedByUserId: userId } },
              blockedByUsers: { none: { blockingUserId: userId } },
              blockedUsers: { none: { blockedUserId: userId } },
            },
          },
        },
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: sortOrder === 'newest' ? 'desc' : 'asc' },
        select: {
          id: true,
          createdAt: true,
          thread: {
            select: THREAD_SELECT(userId),
          },
        },
      });

      let nextCursor: string | undefined;
      if (reposts.length > limit) nextCursor = reposts.pop()!.id;

      const formattedThreads = await Promise.all(
        reposts
          .filter((r) => r.thread)
          .map(async (r) => {
            const threadWithTokens = await enrichThreadWithTokens(r.thread!);
            return {
              ...threadWithTokens,
              likesCount: r.thread!.likes.length,
              repostsCount: r.thread!.reposts.length,
              bookmarksCount: new Set(r.thread!.bookmarks.map((b) => b.userId))
                .size,
              repostedBy: null,
              repostedAt: r.createdAt,
            };
          }),
      );

      return { threads: formattedThreads, nextCursor };
    }),

  bulkUnlikePosts: privateProcedure
    .input(z.object({ postIds: z.array(z.string()).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const { count } = await db.like.deleteMany({
        where: {
          userId,
          postId: { in: input.postIds },
        },
      });

      return { removed: count };
    }),

  bulkUnlikeThreads: privateProcedure
    .input(z.object({ threadIds: z.array(z.string()).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const { count } = await db.like.deleteMany({
        where: {
          userId,
          threadId: { in: input.threadIds },
        },
      });

      return { removed: count };
    }),

  bulkDeleteComments: privateProcedure
    .input(z.object({ postIds: z.array(z.string()).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const { count } = await db.post.updateMany({
        where: {
          id: { in: input.postIds },
          authorId: userId,
          parentPostId: { not: null },
        },
        data: {
          deleted: true,
          status: PostStatus.HIDDEN,
        },
      });

      return { deleted: count };
    }),

  bulkDeleteThreadComments: privateProcedure
    .input(z.object({ threadIds: z.array(z.string()).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const { count } = await db.thread.updateMany({
        where: {
          id: { in: input.threadIds },
          authorId: userId,
          parentId: { not: null },
        },
        data: {
          deleted: true,
          status: PostStatus.HIDDEN,
        },
      });

      return { deleted: count };
    }),

  bulkRemoveReposts: privateProcedure
    .input(z.object({ postIds: z.array(z.string()).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const { count } = await db.repost.deleteMany({
        where: {
          userId,
          postId: { in: input.postIds },
        },
      });

      return { removed: count };
    }),

  bulkRemoveThreadReposts: privateProcedure
    .input(z.object({ threadIds: z.array(z.string()).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const { count } = await db.repost.deleteMany({
        where: {
          userId,
          threadId: { in: input.threadIds },
        },
      });

      return { removed: count };
    }),

  getUserPosts: privateProcedure
    .input(mediaFilterInput)
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx;
      const { startDate, endDate, sortOrder, mediaType } = input;
      const limit = 20;

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = startDate;
      if (endDate) dateFilter.lte = endDate;
      const hasDateFilter = Object.keys(dateFilter).length > 0;

      const mediaWhere: PostWhereInput = {
        authorId: userId,
        parentPostId: null,
        media: { some: {} },
        ...(hasDateFilter ? { createdAt: dateFilter } : {}),
      };

      if (mediaType === 'IMAGE') {
        mediaWhere.media = { some: { fileType: 'IMAGE' } };
      } else if (mediaType === 'VIDEO') {
        mediaWhere.media = { some: { fileType: 'VIDEO' } };
      }

      const posts = await db.post.findMany({
        where: mediaWhere,
        take: limit + 1,
        cursor: input.cursor ? { id: input.cursor } : undefined,
        orderBy: { createdAt: sortOrder === 'newest' ? 'desc' : 'asc' },
        select: {
          id: true,
          text: true,
          createdAt: true,
          media: true,
          repliesCount: true,
          _count: { select: { likes: true } },
        },
      });

      let nextCursor: string | undefined;
      if (posts.length > limit) nextCursor = posts.pop()!.id;

      const formatted = await Promise.all(
        posts.map(async (post) => {
          const postWithTokens = await enrichPostWithTokens(post);
          return {
            ...postWithTokens,
            likesCount: post._count.likes,
          };
        }),
      );

      return { posts: formatted, nextCursor };
    }),

  getUserThreads: privateProcedure
    .input(filterInput)
    .query(async ({ input, ctx }) => {
      const { userId, db } = ctx;
      const { startDate, endDate, sortOrder, cursor } = input;
      const limit = 20;

      const dateFilter: any = {};
      if (startDate) dateFilter.gte = startDate;
      if (endDate) dateFilter.lte = endDate;
      const hasDateFilter = Object.keys(dateFilter).length > 0;

      const rawThreads = await db.thread.findMany({
        where: {
          authorId: userId,
          parentId: null,
          status: PostStatus.VISIBLE,
          deleted: false,
          ...(hasDateFilter ? { createdAt: dateFilter } : {}),
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { createdAt: sortOrder === 'newest' ? 'desc' : 'asc' },
        select: THREAD_SELECT(userId),
      });

      let nextCursor: string | undefined;
      if (rawThreads.length > limit) nextCursor = rawThreads.pop()!.id;

      const formattedThreads = await Promise.all(
        rawThreads.map(async (thread) => {
          const threadWithTokens = await enrichThreadWithTokens(thread);
          return {
            ...threadWithTokens,
            likesCount: thread.likes.length,
            repostsCount: thread.reposts.length,
            bookmarksCount: new Set(thread.bookmarks.map((b) => b.userId)).size,
          };
        }),
      );

      return { threads: formattedThreads, nextCursor };
    }),

  bulkDeletePosts: privateProcedure
    .input(z.object({ postIds: z.array(z.string()).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const { count } = await db.post.updateMany({
        where: {
          id: { in: input.postIds },
          authorId: userId,
        },
        data: {
          deleted: true,
          status: PostStatus.HIDDEN,
        },
      });

      return { deleted: count };
    }),

  bulkDeleteThreads: privateProcedure
    .input(z.object({ threadIds: z.array(z.string()).min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx;

      const { count } = await db.thread.updateMany({
        where: {
          id: { in: input.threadIds },
          authorId: userId,
        },
        data: {
          deleted: true,
          status: PostStatus.HIDDEN,
        },
      });

      return { deleted: count };
    }),
});
