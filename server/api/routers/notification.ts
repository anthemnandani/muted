import { type PostMedia } from '@/lib/types';
import { GET_USER } from '@/server/constants';
import { NotificationType } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '../trpc';

export const notificationRouter = createTRPCRouter({
  getNotifications: privateProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to get notifications',
        });
      }

      const notifications = await ctx.db.notification.findMany({
        where: {
          receiverUserId: userId,
        },
        take: limit + 1,
        cursor: cursor
          ? { id: cursor.id, createdAt: cursor.createdAt }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          type: true,
          createdAt: true,
          message: true,
          senderUser: {
            select: {
              ...GET_USER,
            },
          },
          post: {
            select: {
              id: true,
              media: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (notifications.length > limit) {
        const nextItem = notifications[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        notifications.length = limit;
      }

      return {
        notifications: notifications.map((notification) => ({
          ...notification,
          media: notification.post?.media as Array<PostMedia>,
          postId: notification.post?.id!,
        })),
        nextCursor,
      };
    }),

  getUnreadCount: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to get unread count',
      });
    }

    const unreadCount = await ctx.db.notification.count({
      where: {
        receiverUserId: userId,
        read: false,
      },
    });

    return { unreadCount };
  }),

  markAllAsRead: privateProcedure.mutation(async ({ ctx }) => {
    const { userId } = ctx;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to mark notifications as read',
      });
    }

    await ctx.db.notification.updateMany({
      where: {
        receiverUserId: userId,
        read: false,
      },
      data: {
        read: true,
      },
    });

    return { success: true };
  }),

  getLikeNotifications: privateProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to get notifications',
        });
      }

      const notifications = await ctx.db.notification.findMany({
        where: {
          receiverUserId: userId,
          type: NotificationType.LIKE,
        },
        take: limit + 1,
        cursor: cursor
          ? { id: cursor.id, createdAt: cursor.createdAt }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          type: true,
          createdAt: true,
          message: true,
          read: true,
          senderUser: {
            select: {
              ...GET_USER,
            },
          },
          post: {
            select: {
              id: true,
              media: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (notifications.length > limit) {
        const nextItem = notifications[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        notifications.length = limit;
      }

      return {
        notifications: notifications.map((notification) => ({
          ...notification,
          media: notification.post?.media as Array<PostMedia>,
          postId: notification.post?.id!,
        })),
        nextCursor,
      };
    }),

  getCommentNotifications: privateProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to get notifications',
        });
      }

      const notifications = await ctx.db.notification.findMany({
        where: {
          receiverUserId: userId,
          type: NotificationType.COMMENT,
        },
        take: limit + 1,
        cursor: cursor
          ? { id: cursor.id, createdAt: cursor.createdAt }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          type: true,
          createdAt: true,
          message: true,
          read: true,
          senderUser: {
            select: {
              ...GET_USER,
            },
          },
          post: {
            select: {
              id: true,
              media: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (notifications.length > limit) {
        const nextItem = notifications[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        notifications.length = limit;
      }

      return {
        notifications: notifications.map((notification) => ({
          ...notification,
          media: notification.post?.media as Array<PostMedia>,
          postId: notification.post?.id!,
        })),
        nextCursor,
      };
    }),

  getMentionNotifications: privateProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to get notifications',
        });
      }

      const notifications = await ctx.db.notification.findMany({
        where: {
          receiverUserId: userId,
          type: NotificationType.MENTION,
        },
        take: limit + 1,
        cursor: cursor
          ? { id: cursor.id, createdAt: cursor.createdAt }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          type: true,
          createdAt: true,
          message: true,
          read: true,
          senderUser: {
            select: {
              ...GET_USER,
            },
          },
          post: {
            select: {
              id: true,
              media: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (notifications.length > limit) {
        const nextItem = notifications[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        notifications.length = limit;
      }

      return {
        notifications: notifications.map((notification) => ({
          ...notification,
          media: notification.post?.media as Array<PostMedia>,
          postId: notification.post?.id!,
        })),
        nextCursor,
      };
    }),

  getFollowerNotifications: privateProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to get notifications',
        });
      }

      const notifications = await ctx.db.notification.findMany({
        where: {
          receiverUserId: userId,
          type: NotificationType.FOLLOWER,
        },
        take: limit + 1,
        cursor: cursor
          ? { id: cursor.id, createdAt: cursor.createdAt }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          type: true,
          createdAt: true,
          message: true,
          read: true,
          senderUser: {
            select: {
              ...GET_USER,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (notifications.length > limit) {
        const nextItem = notifications[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        notifications.length = limit;
      }

      return {
        notifications,
        nextCursor,
      };
    }),
});
