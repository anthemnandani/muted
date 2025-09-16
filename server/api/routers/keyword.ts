import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { FeedType, Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

const getSelectedFeeds = (feeds: {
  forYou: boolean;
  following: boolean;
  friends: boolean;
}): FeedType[] => {
  const selectedFeeds = Object.entries(feeds)
    .filter(([, isSelected]) => isSelected)
    .map(([feedName]) => {
      switch (feedName) {
        case 'forYou':
          return FeedType.FOR_YOU;
        case 'following':
          return FeedType.FOLLOWING;
        case 'friends':
          return FeedType.FRIENDS;
        default:
          return null;
      }
    })
    .filter((feed): feed is FeedType => feed !== null);

  if (selectedFeeds.length === 0) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Please select at least one feed to filter from.',
    });
  }
  return selectedFeeds;
};

export const keywordRouter = createTRPCRouter({
  addKeyword: privateProcedure
    .input(
      z.object({
        keyword: z.string().min(1, 'Keyword cannot be empty.').max(70),
        feeds: z.object({
          forYou: z.boolean(),
          following: z.boolean(),
          friends: z.boolean(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { keyword, feeds } = input;
      const { userId, db } = ctx;

      const originalKeyword = keyword.trim();

      const existingKeyword = await db.filteredKeyword.findFirst({
        where: {
          userId,
          keyword: {
            equals: originalKeyword,
            mode: 'insensitive',
          },
        },
      });

      if (existingKeyword) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `You have already added the keyword "${originalKeyword}".`,
        });
      }

      const selectedFeeds = getSelectedFeeds(feeds);

      const newKeyword = await db.filteredKeyword.create({
        data: {
          userId,
          keyword: originalKeyword,
          feeds: selectedFeeds,
        },
      });

      return newKeyword;
    }),

  updateKeyword: privateProcedure
    .input(
      z.object({
        id: z.string(),
        keyword: z.string().min(1, 'Keyword cannot be empty.').max(70),
        feeds: z.object({
          forYou: z.boolean(),
          following: z.boolean(),
          friends: z.boolean(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, keyword, feeds } = input;
      const { userId, db } = ctx;
      const originalKeyword = keyword.trim();

      const existingKeyword = await db.filteredKeyword.findFirst({
        where: {
          userId,
          keyword: {
            equals: originalKeyword,
            mode: 'insensitive',
          },
          NOT: {
            id: id,
          },
        },
      });

      if (existingKeyword) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: `You have already added the keyword "${originalKeyword}".`,
        });
      }

      const selectedFeeds = getSelectedFeeds(feeds);

      const updatedKeyword = await db.filteredKeyword.update({
        where: {
          id,
        },
        data: {
          keyword: originalKeyword,
          feeds: selectedFeeds,
        },
      });

      return updatedKeyword;
    }),

  getKeywords: privateProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z
          .object({
            userId: z.string(),
            keyword: z.string(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 30, cursor }, ctx }) => {
      const { userId, db } = ctx;

      const whereClause = {
        userId,
      };

      const getItemsPromise = db.filteredKeyword.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { userId_keyword: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const getCountPromise = db.filteredKeyword.count({
        where: whereClause,
      });

      const [items, totalCount] = await Promise.all([
        getItemsPromise,
        getCountPromise,
      ]);

      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        if (nextItem) {
          nextCursor = {
            userId,
            keyword: nextItem.keyword,
          };
        }
      }

      return {
        items,
        nextCursor,
        totalCount,
      };
    }),

  deleteKeyword: privateProcedure
    .input(z.object({ keywordId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      try {
        await db.filteredKeyword.delete({
          where: {
            id: input.keywordId,
          },
        });
        return { success: true };
      } catch (error: any) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2025'
        ) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Keyword not found.',
          });
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Could not delete keyword.',
        });
      }
    }),
});
