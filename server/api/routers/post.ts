import { getUserEmail } from '@/lib/utils';
import {
  GET_COUNT,
  GET_LIKES,
  GET_REPLIES,
  GET_REPOSTS,
  GET_USER,
} from '@/server/constants';
import { PostPrivacy } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { Filter } from 'bad-words';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '../trpc';

export const postRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        text: z.string().min(3, {
          message: 'Text must be at least 3 character',
        }),
        imageUrl: z.string().optional(),
        privacy: z.nativeEnum(PostPrivacy).default('ANYONE'),
        quoteId: z.string().optional(),
        postAuthor: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user, userId } = ctx;
      const email = getUserEmail(user);
      const dbUser = await ctx.db.user.findUnique({
        where: {
          email: email,
        },
        select: {
          verified: true,
        },
      });

      if (!dbUser) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const filter = new Filter();
      const filteredText = filter.clean(input.text);

      const transactionResult = await ctx.db.$transaction(async (prisma) => {
        const newpost = await ctx.db.post.create({
          data: {
            text: filteredText,
            authorId: userId,
            images: input.imageUrl ? [input.imageUrl] : [],
            privacy: input.privacy,
            quoteId: input.quoteId,
          },
          select: {
            id: true,
            author: true,
          },
        });

        if (input.postAuthor && userId !== input.postAuthor) {
          await prisma.notification.create({
            data: {
              type: 'QUOTE',
              senderUserId: userId,
              receiverUserId: input.postAuthor,
              postId: newpost.id,
              message: input.text,
            },
          });
        }

        return {
          newpost,
        };
      });

      if (!transactionResult) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
      }

      return {
        createPost: transactionResult.newpost,
        success: true,
      };
    }),

  getInfinitePosts: publicProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 10, cursor, searchQuery }, ctx }) => {
      const allPosts = await ctx.db.post.findMany({
        where: {
          text: {
            contains: searchQuery,
          },
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

      if (allPosts.length > limit) {
        const nextItem = allPosts.pop();
        if (nextItem != null) {
          nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
        }
      }

      return {
        posts: allPosts.map((post) => ({
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
});
