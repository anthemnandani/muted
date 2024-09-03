import {
  GET_COUNT,
  GET_LIKES,
  GET_REPLIES,
  GET_REPOSTS,
  GET_USER,
} from '@/server/constants';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '../trpc';
import { getUserEmail } from '@/lib/utils';

export const userRouter = createTRPCRouter({
  userInfo: privateProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const isUser = await ctx.db.user.findUnique({
        where: {
          username: input.username,
        },
      });

      if (!isUser) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const userProfileInfo = await ctx.db.user.findUnique({
        where: {
          username: input.username,
        },
        include: {
          followers: true,
        },
      });

      if (!userProfileInfo) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return {
        userDetails: {
          id: userProfileInfo.id,
          image: userProfileInfo.image,
          fullName: userProfileInfo.fullName,
          username: userProfileInfo.username,
          bio: userProfileInfo.bio,
          link: userProfileInfo.link,
          privacy: userProfileInfo.privacy,
          createdAt: userProfileInfo.createdAt,
          isAdmin: userProfileInfo.isAdmin,
          followers: userProfileInfo.followers,
        },
      };
    }),

  postInfo: privateProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { username, limit = 10, cursor }, ctx }) => {
      const isUser = await ctx.db.user.findUnique({
        where: {
          username,
        },
      });

      if (!isUser) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const userProfileInfo = await ctx.db.post.findMany({
        where: {
          authorId: isUser.id,
          parentPostId: null,
        },
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          createdAt: true,
          text: true,
          images: true,
          parentPostId: true,
          quoteId: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...GET_LIKES,
          ...GET_REPLIES,
          ...GET_COUNT,
          ...GET_REPOSTS,
        },
      });

      let nextCursor: typeof cursor | undefined;

      if (userProfileInfo.length > limit) {
        const nextItem = userProfileInfo.pop();
        if (nextItem != null) {
          nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
        }
      }

      return {
        posts: userProfileInfo.map((post) => ({
          id: post.id,
          createdAt: post.createdAt,
          text: post.text,
          parentPostId: post.parentPostId,
          author: post.author,
          count: {
            likeCount: post._count.likes,
            replyCount: post._count.replies,
          },
          likes: post.likes,
          replies: post.replies,
          quoteId: post.quoteId,
          images: post.images,
          reposts: post.reposts,
        })),
        nextCursor,
      };
    }),

  updateProfile: privateProcedure
    .input(
      z.object({
        image: z.string().url().optional(),
        link: z.string().url().optional(),
        bio: z.string().max(150).optional(),
        privacy: z.enum(['PUBLIC', 'PRIVATE']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const email = getUserEmail(user);
      const dbUser = await ctx.db.user.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
          verified: true,
        },
      });

      if (!dbUser) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: dbUser.id },
        data: {
          image: input.image,
          link: input.link,
          bio: input.bio,
          privacy: input.privacy,
        },
      });

      return {
        updatedUser,
        success: true,
      };
    }),
});
