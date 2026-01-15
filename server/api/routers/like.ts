import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { NotificationType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const likeRouter = createTRPCRouter({
  toggleLike: privateProcedure
    .input(
      z.object({
        id: z.string(),
        intent: z.boolean().optional(),
      })
    )
    .mutation(async ({ input: { id, intent }, ctx }) => {
      const { userId, db } = ctx;
      const data = { postId: id, userId };

      const existingLike = await db.like.findUnique({
        where: { userId_postId: data },
      });

      const shouldCreate = intent !== undefined ? intent : existingLike == null;
      const shouldDelete =
        intent !== undefined ? !intent : existingLike != null;

      if (shouldCreate) {
        if (existingLike) return { addedLike: true };

        const transactionResult = await db.$transaction(async (prisma) => {
          const createdLike = await prisma.like.create({
            data,
            select: {
              post: { select: { text: true, author: true } },
            },
          });

          if (createdLike.post?.author.id !== userId) {
            await prisma.notification.create({
              data: {
                type: NotificationType.LIKE,
                senderUserId: userId,
                receiverUserId: createdLike.post?.author.id,
                postId: data.postId,
                message: 'liked your post',
              },
            });
          }
          return { createdLike };
        });

        if (!transactionResult)
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        return { addedLike: true };
      }

      if (shouldDelete) {
        if (!existingLike) return { addedLike: false };

        await db.like.delete({
          where: { userId_postId: data },
        });

        return { addedLike: false };
      }

      return { addedLike: !!existingLike };
    }),
});
