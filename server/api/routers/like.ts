import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { NotificationType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const likeRouter = createTRPCRouter({
  toggleLike: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input: { id }, ctx }) => {
      const { userId, db } = ctx;

      const data = { postId: id, userId };

      const existingLike = await db.like.findUnique({
        where: {
          postId_userId: data,
        },
      });

      if (existingLike == null) {
        const transactionResult = await db.$transaction(async (prisma) => {
          const createdLike = await prisma.like.create({
            data,
            select: {
              post: {
                select: {
                  text: true,
                  author: true,
                },
              },
            },
          });

          if (createdLike.post.author.id === userId) {
            return {
              createdLike,
            };
          }

          const existingNotification = await prisma.notification.findFirst({
            where: {
              senderUserId: userId,
              postId: data.postId,
              type: NotificationType.LIKE,
            },
            select: { id: true },
          });

          if (existingNotification) {
            await prisma.notification.update({
              where: { id: existingNotification.id },
              data: {
                createdAt: new Date(),
              },
            });
          } else {
            await prisma.notification.create({
              data: {
                type: NotificationType.LIKE,
                senderUserId: userId,
                receiverUserId: createdLike.post.author.id,
                postId: data.postId,
                message: 'liked your post',
              },
            });
          }

          return {
            createdLike,
          };
        });

        if (!transactionResult) {
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        }

        return { addedLike: true };
      } else {
        const transactionResult = await db.$transaction(async (prisma) => {
          const removeLike = await prisma.like.delete({
            where: {
              postId_userId: data,
            },
            select: {
              post: {
                select: {
                  author: true,
                },
              },
            },
          });

          // if (removeLike.post.author.id !== userId) {
          //   const notification = await prisma.notification.findUnique({
          //     where: {
          //       unique_like_notification: {
          //         senderUserId: userId,
          //         postId: data.postId,
          //         type: NotificationType.LIKE,
          //       },
          //     },
          //     select: {
          //       id: true,
          //     },
          //   });

          //   if (notification) {
          //     await prisma.notification.delete({
          //       where: {
          //         id: notification.id,
          //       },
          //     });
          //   }
          // }

          return {
            removeLike,
          };
        });

        if (!transactionResult) {
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        }

        return { addedLike: false };
      }
    }),
});
