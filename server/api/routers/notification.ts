import {
  FollowRequestStatus,
  NotificationType,
} from '@/generated/prisma/enums';
import { enrichThumbnailToken } from '@/lib/utils';
import { GET_USER } from '@/server/constants';
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
      }),
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId, db } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to get notifications',
        });
      }

      const notifications = await db.notification.findMany({
        where: {
          receiverUserId: userId,
          NOT: {
            type: NotificationType.FOLLOW_REQUEST,
          },
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
        notifications: await Promise.all(
          notifications.map(async (notification) => ({
            ...notification,
            media: await enrichThumbnailToken(notification.post?.media),
            postId: notification.post?.id!,
          })),
        ),
        nextCursor,
      };
    }),

  getUnreadCount: privateProcedure.query(async ({ ctx }) => {
    const { userId, db } = ctx;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to get unread count',
      });
    }

    const unreadCount = await db.notification.count({
      where: {
        receiverUserId: userId,
        read: false,
      },
    });

    return { unreadCount };
  }),

  markAllAsRead: privateProcedure.mutation(async ({ ctx }) => {
    const { userId, db } = ctx;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to mark notifications as read',
      });
    }

    await db.notification.updateMany({
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
      }),
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId, db } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to get notifications',
        });
      }

      const notifications = await db.notification.findMany({
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
        notifications: await Promise.all(
          notifications.map(async (notification) => ({
            ...notification,
            media: await enrichThumbnailToken(notification.post?.media),
            postId: notification.post?.id!,
          })),
        ),
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
      }),
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId, db } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to get notifications',
        });
      }

      const notifications = await db.notification.findMany({
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
        notifications: await Promise.all(
          notifications.map(async (notification) => ({
            ...notification,
            media: await enrichThumbnailToken(notification.post?.media),
            postId: notification.post?.id!,
          })),
        ),
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
      }),
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId, db } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to get notifications',
        });
      }

      const notifications = await db.notification.findMany({
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
        notifications: await Promise.all(
          notifications.map(async (notification) => ({
            ...notification,
            media: await enrichThumbnailToken(notification.post?.media),
            postId: notification.post?.id!,
          })),
        ),
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
      }),
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId, db } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to get notifications',
        });
      }

      const notifications = await db.notification.findMany({
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

  getFollowRequests: privateProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      }),
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId, db } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to get follow requests',
        });
      }
      const requests = await db.followRequest.findMany({
        where: {
          receiverId: userId,
          status: 'PENDING',
        },
        include: {
          requester: {
            select: {
              ...GET_USER,
            },
          },
        },
        take: limit + 1,
        cursor: cursor
          ? { id: cursor.id, createdAt: cursor.createdAt }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
      });
      let nextCursor: typeof cursor | undefined;
      if (requests.length > limit) {
        const nextItem = requests[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        requests.length = limit;
      }

      return {
        requests,
        nextCursor,
      };
    }),

  acceptFollowRequest: privateProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId, db } = ctx;
      const { requestId } = input;

      const request = await db.followRequest.findUnique({
        where: { id: requestId },
      });

      if (
        !request ||
        request.receiverId !== userId ||
        request.status !== 'PENDING'
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Request not found or you lack permission.',
        });
      }

      await db.$transaction(async (prisma) => {
        await prisma.followRequest.delete({ where: { id: requestId } });

        await prisma.follow.create({
          data: {
            followerId: request.requesterId,
            followingId: userId,
          },
        });
        await prisma.notification.create({
          data: {
            type: NotificationType.FOLLOWER,
            senderUserId: request.requesterId,
            receiverUserId: userId,
            message: 'started following you',
          },
        });

        await prisma.notification.create({
          data: {
            type: NotificationType.FOLLOWER,
            senderUserId: userId,
            receiverUserId: request.requesterId,
            message: 'approved your follow request.',
          },
        });
      });

      return { success: true };
    }),

  deleteFollowRequest: privateProcedure
    .input(z.object({ requestId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const { userId, db } = ctx;
      const { requestId } = input;

      const request = await db.followRequest.findUnique({
        where: { id: requestId },
      });

      if (!request || request.receiverId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await db.followRequest.delete({ where: { id: requestId } });

      return { success: true };
    }),

  getFollowRequestsCount: privateProcedure.query(async ({ ctx }) => {
    const { userId, db } = ctx;

    if (!userId) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to get unread count',
      });
    }

    const followRequestsCount = await db.followRequest.count({
      where: {
        receiverId: userId,
        status: FollowRequestStatus.PENDING,
      },
    });

    return { followRequestsCount };
  }),
});
