import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '../trpc';
import { getUserEmail } from '@/lib/utils';
import { TRPCError } from '@trpc/server';
import { Filter } from 'bad-words';
import { PostPrivacy } from '@prisma/client';

export const postRouter = createTRPCRouter({
  createThread: privateProcedure
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
});
