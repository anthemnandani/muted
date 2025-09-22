import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import {
  MessageReportCategory,
  MessageReportStatus,
  MessageRequestStatus,
  MessageStatus,
  Prisma,
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const chatRouter = createTRPCRouter({
  getChats: privateProcedure.query(async ({ ctx }) => {
    const { userId, db } = ctx;

    try {
      const rawChats = await db.chat.findMany({
        where: {
          OR: [
            { senderId: userId },
            {
              receiverId: userId,
              messageRequest: false,
            },
          ],
          isActive: true,
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
              image: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              fullName: true,
              image: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  image: true,
                },
              },
            },
          },
          _count: {
            select: {
              messages: {
                where: {
                  senderId: { not: userId },
                  status: { not: MessageStatus.SEEN },
                },
              },
            },
          },
          chatDeletions: {
            where: {
              userId,
              isActive: true,
            },
          },
          mutedBy: {
            where: {
              userId,
              isActive: true,
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      const messageRequests = await db.chat.findMany({
        where: {
          receiverId: userId,
          messageRequest: true,
          messageRequestStatus: MessageRequestStatus.PENDING,
          messages: {
            some: {},
          },
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true,
              fullName: true,
              image: true,
            },
          },
          receiver: {
            select: {
              id: true,
              username: true,
              fullName: true,
              image: true,
            },
          },
          messages: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  image: true,
                },
              },
            },
          },
          chatDeletions: {
            where: {
              userId,
              isActive: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const visibleChats = rawChats.filter((chat) => {
        const activeDeletion = chat.chatDeletions[0];
        return !activeDeletion;
      });

      const transformedChats = visibleChats.map((chat) => {
        const userDeletion = chat.chatDeletions[0];
        const isMuted = chat.mutedBy.length > 0;

        let lastMessage: any = chat.messages[0] || null;
        if (userDeletion && lastMessage) {
          if (new Date(lastMessage.createdAt) <= userDeletion.deletedAt) {
            lastMessage = null;
          }
        }

        return {
          id: chat.id,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          lastMessageAt: chat.lastMessageAt,
          participants: [chat.sender, chat.receiver],
          lastMessage,
          unreadCount: isMuted ? 0 : chat._count.messages,
          messageRequest: chat.messageRequest,
          messageRequestStatus: chat.messageRequestStatus,
          requestedById: chat.requestedById,
          isMuted,
        };
      });

      const transformedRequests = messageRequests.map((request) => {
        return {
          id: request.id,
          createdAt: request.createdAt,
          updatedAt: request.updatedAt,
          lastMessageAt: request.lastMessageAt,
          participants: [request.sender, request.receiver],
          lastMessage: request.messages[0] || null,
          unreadCount: 0,
          messageRequest: request.messageRequest,
          messageRequestStatus: request.messageRequestStatus,
          requestedById: request.requestedById,
        };
      });

      return {
        chats: transformedChats,
        messageRequests: transformedRequests,
        messageRequestsCount: messageRequests.length,
      };
    } catch (error) {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to fetch chats',
      });
    }
  }),

  getMessages: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string() }).optional(),
      })
    )
    .query(async ({ ctx, input: { limit = 60, cursor, chatId } }) => {
      const { userId, db } = ctx;

      try {
        const chat = await db.chat.findUnique({
          where: { id: chatId },
          include: {
            chatDeletions: { where: { userId } },
          },
        });

        if (!chat) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Chat not found' });
        }

        const chatDeletion = chat.chatDeletions[0];

        const whereClause: Prisma.MessageWhereInput = {
          chatId,
          deletions: {
            none: {
              userId,
            },
          },
        };

        if (chatDeletion && chatDeletion.lastMessageId) {
          const lastMessageBeforeDeletion = await db.message.findUnique({
            where: { id: chatDeletion.lastMessageId },
            select: { createdAt: true },
          });

          if (lastMessageBeforeDeletion) {
            whereClause.createdAt = {
              gt: lastMessageBeforeDeletion.createdAt,
            };
          }
        }

        const messages = await db.message.findMany({
          where: whereClause,
          take: limit + 1,
          cursor: cursor ? { id: cursor.id } : undefined,
          orderBy: { createdAt: 'desc' },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                fullName: true,
                image: true,
              },
            },
            reactions: {
              include: {
                user: {
                  select: { id: true, username: true },
                },
              },
            },
          },
        });

        let nextCursor: typeof cursor | undefined;
        if (messages.length > limit) {
          const nextItem = messages.pop();
          if (nextItem) {
            nextCursor = { id: nextItem.id };
          }
        }

        return { messages: messages.reverse(), nextCursor };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch messages',
        });
      }
    }),

  deleteChat: privateProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      try {
        const lastMessage = await db.message.findFirst({
          where: { chatId: input.chatId },
          orderBy: { createdAt: 'desc' },
          select: { id: true },
        });

        await db.chatDeletion.upsert({
          where: {
            chatId_userId: {
              chatId: input.chatId,
              userId,
            },
          },
          update: {
            deletedAt: new Date(),
            lastMessageId: lastMessage?.id,
            isActive: true,
          },
          create: {
            chatId: input.chatId,
            userId,
            deletedAt: new Date(),
            lastMessageId: lastMessage?.id,
            isActive: true,
          },
        });
        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete chat',
        });
      }
    }),

  deleteMessages: privateProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      try {
        const chat = await db.chat.findUnique({
          where: {
            id: input.chatId,
          },
        });

        if (!chat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found',
          });
        }

        await db.chatDeletion.upsert({
          where: {
            chatId_userId: {
              chatId: input.chatId,
              userId,
            },
          },
          update: {
            deletedAt: new Date(),
          },
          create: {
            chatId: input.chatId,
            userId,
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete messages',
        });
      }
    }),

  restoreChat: privateProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      try {
        await db.chatDeletion.deleteMany({
          where: {
            chatId: input.chatId,
            userId,
          },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to restore chat',
        });
      }
    }),

  getOrCreateChat: privateProcedure
    .input(z.object({ otherUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      try {
        let existingChat = await db.chat.findFirst({
          where: {
            OR: [
              { senderId: userId, receiverId: input.otherUserId },
              { senderId: input.otherUserId, receiverId: userId },
            ],
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                fullName: true,
                image: true,
              },
            },
            receiver: {
              select: {
                id: true,
                username: true,
                fullName: true,
                image: true,
              },
            },
            chatDeletions: {
              where: {
                userId,
              },
            },
          },
        });

        if (existingChat) {
          if (existingChat.chatDeletions.length > 0) {
            await db.chatDeletion.deleteMany({
              where: {
                chatId: existingChat.id,
                userId,
              },
            });
          }

          const transformedChat = {
            id: existingChat.id,
            createdAt: existingChat.createdAt,
            updatedAt: existingChat.updatedAt,
            lastMessageAt: existingChat.lastMessageAt,
            participants: [existingChat.sender, existingChat.receiver],
            lastMessage: null,
            unreadCount: 0,
            messageRequest: existingChat.messageRequest,
            messageRequestStatus: existingChat.messageRequestStatus,
            requestedById: existingChat.requestedById,
          };
          return {
            chat: transformedChat,
            isNew: false,
          };
        }

        const isFollowing = await db.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: input.otherUserId,
            },
          },
        });

        const isFollowedBy = await db.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: input.otherUserId,
              followingId: userId,
            },
          },
        });
        const areMutualFriends = isFollowing && isFollowedBy;

        const newChat = await db.chat.create({
          data: {
            senderId: userId,
            receiverId: input.otherUserId,
            messageRequest: !areMutualFriends,
            ...(!areMutualFriends && {
              messageRequestStatus: MessageRequestStatus.PENDING,
            }),
            requestedById: areMutualFriends ? null : userId,
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                fullName: true,
                image: true,
              },
            },
            receiver: {
              select: {
                id: true,
                username: true,
                fullName: true,
                image: true,
              },
            },
          },
        });

        const transformedChat = {
          id: newChat.id,
          createdAt: newChat.createdAt,
          updatedAt: newChat.updatedAt,
          lastMessageAt: newChat.lastMessageAt,
          participants: [newChat.sender, newChat.receiver],
          lastMessage: null,
          unreadCount: 0,
          messageRequest: newChat.messageRequest,
          messageRequestStatus: newChat.messageRequestStatus,
          requestedById: newChat.requestedById,
        };

        return {
          chat: transformedChat,
          isNew: true,
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get or create chat',
        });
      }
    }),

  resetUnreadCount: privateProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      try {
        const chat = await db.chat.findUnique({
          where: { id: input.chatId },
        });

        if (!chat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found',
          });
        }

        if (chat.senderId !== userId && chat.receiverId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Unauthorized access to chat',
          });
        }

        const updatedResult = await db.message.updateMany({
          where: {
            chatId: input.chatId,
            senderId: { not: userId },
            status: { not: MessageStatus.SEEN },
          },
          data: {
            status: MessageStatus.SEEN,
            readAt: new Date(),
          },
        });

        return {
          success: true,
          updatedCount: updatedResult.count,
        };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to reset unread count',
        });
      }
    }),

  acceptMessageRequest: privateProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      try {
        const chat = await db.chat.findUnique({
          where: { id: input.chatId },
        });

        if (!chat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found',
          });
        }

        if (chat.receiverId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot accept this message request',
          });
        }

        await db.message.updateMany({
          where: {
            chatId: input.chatId,
            senderId: { not: userId },
          },
          data: {
            status: 'SEEN',
            readAt: new Date(),
          },
        });

        const updatedChat = await db.chat.update({
          where: { id: input.chatId },
          data: {
            messageRequest: false,
            messageRequestStatus: MessageRequestStatus.ACCEPTED,
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true,
                fullName: true,
                image: true,
              },
            },
            receiver: {
              select: {
                id: true,
                username: true,
                fullName: true,
                image: true,
              },
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: {
                    id: true,
                    username: true,
                    fullName: true,
                    image: true,
                  },
                },
              },
            },
          },
        });

        const transformedChat = {
          id: updatedChat.id,
          createdAt: updatedChat.createdAt,
          updatedAt: updatedChat.updatedAt,
          lastMessageAt: updatedChat.lastMessageAt,
          participants: [updatedChat.sender, updatedChat.receiver],
          lastMessage: updatedChat.messages[0] || null,
          unreadCount: 0,
          messageRequest: updatedChat.messageRequest,
          messageRequestStatus: updatedChat.messageRequestStatus,
          requestedById: updatedChat.requestedById,
        };

        return { chat: transformedChat };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to accept message request',
        });
      }
    }),

  declineMessageRequest: privateProcedure
    .input(z.object({ chatId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      try {
        const chat = await db.chat.findUnique({
          where: { id: input.chatId },
        });

        if (!chat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found',
          });
        }

        if (chat.receiverId !== userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot decline this message request',
          });
        }

        const result = await db.$transaction(async (prisma) => {
          await prisma.chat.update({
            where: { id: input.chatId },
            data: {
              messageRequestStatus: MessageRequestStatus.DECLINED,
            },
          });
          await prisma.chatDeletion.upsert({
            where: {
              chatId_userId: {
                chatId: input.chatId,
                userId,
              },
            },
            update: {
              deletedAt: new Date(),
              isActive: true,
            },
            create: {
              chatId: input.chatId,
              userId,
              deletedAt: new Date(),
              isActive: true,
            },
          });

          return { success: true };
        });

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to decline message request',
        });
      }
    }),

  deleteMessage: privateProcedure
    .input(
      z.object({
        messageId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      try {
        const result = await db.$transaction(async (prisma) => {
          const message = await prisma.message.findUnique({
            where: { id: input.messageId },
            include: {
              chat: true,
            },
          });

          if (!message) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Message not found',
            });
          }
          if (
            message.chat.senderId !== userId &&
            message.chat.receiverId !== userId
          ) {
            throw new TRPCError({
              code: 'FORBIDDEN',
              message: 'Unauthorized access to message',
            });
          }

          const existingDeletion = await prisma.messageDeletion.findUnique({
            where: {
              messageId_userId: {
                messageId: input.messageId,
                userId,
              },
            },
          });

          if (existingDeletion) {
            throw new TRPCError({
              code: 'BAD_REQUEST',
              message: 'Message already deleted',
            });
          }

          await prisma.messageDeletion.create({
            data: {
              messageId: input.messageId,
              userId,
            },
          });

          return { success: true };
        });

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete message',
        });
      }
    }),

  toggleMute: privateProcedure
    .input(
      z.object({
        chatId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      const chat = await db.chat.findUnique({
        where: { id: input.chatId },
      });

      if (!chat) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Chat not found',
        });
      }

      if (chat.senderId !== userId && chat.receiverId !== userId) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Unauthorized access to chat',
        });
      }

      const existingMute = await db.mutedChat.findUnique({
        where: {
          chatId_userId: {
            chatId: input.chatId,
            userId,
          },
        },
      });

      if (existingMute == null) {
        await db.mutedChat.create({
          data: {
            chatId: input.chatId,
            userId,
            isActive: true,
          },
        });
        return { muted: true };
      } else {
        await db.mutedChat.delete({
          where: {
            chatId_userId: {
              chatId: input.chatId,
              userId,
            },
          },
        });
        return { muted: false };
      }
    }),

  reportMessage: privateProcedure
    .input(
      z.object({
        messageId: z.string(),
        category: z.nativeEnum(MessageReportCategory),
        reason: z.string().min(1, 'Reason is required'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      try {
        const message = await db.message.findUnique({
          where: { id: input.messageId },
          include: {
            sender: true,
            chat: true,
          },
        });

        if (!message) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Message not found',
          });
        }

        if (
          message.chat.senderId !== userId &&
          message.chat.receiverId !== userId
        ) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'You cannot report this message',
          });
        }

        if (message.senderId === userId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You cannot report your own message',
          });
        }

        await db.messageReport.upsert({
          where: {
            reporterId_messageId: {
              reporterId: userId,
              messageId: input.messageId,
            },
          },
          create: {
            messageId: input.messageId,
            reporterId: userId,
            targetUserId: message.senderId!,
            category: input.category,
            reason: input.reason,
          },
          update: {
            category: input.category,
            reason: input.reason,
            status: MessageReportStatus.PENDING,
            reviewedAt: null,
            updatedAt: new Date(),
          },
        });

        return { success: true };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to report message',
        });
      }
    }),
});
