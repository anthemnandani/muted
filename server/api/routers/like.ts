import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { NotificationType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const likeRouter = createTRPCRouter({
  toggleLike: privateProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(['POST', 'THREAD']),
        intent: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input: { id, intent, type }, ctx }) => {
      const { userId, db } = ctx;

      const isThread = type === 'THREAD';
      const whereClause = isThread
        ? { userId_threadId: { userId, threadId: id } }
        : { userId_postId: { userId, postId: id } };

      const data = isThread ? { threadId: id, userId } : { postId: id, userId };

      const existingLike = await db.like.findUnique({
        where: whereClause,
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
              post: { select: { authorId: true } },
              thread: { select: { authorId: true } },
            },
          });

          const targetAuthorId = isThread
            ? createdLike.thread?.authorId
            : createdLike.post?.authorId;

          if (targetAuthorId) {
            await prisma.notification.create({
              data: {
                type: NotificationType.LIKE,
                senderUserId: userId,
                receiverUserId: targetAuthorId,
                [isThread ? 'threadId' : 'postId']: id,
                message: isThread ? 'liked your thread' : 'liked your post',
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
          where: whereClause,
        });

        return { addedLike: false };
      }

      return { addedLike: !!existingLike };
    }),
});
