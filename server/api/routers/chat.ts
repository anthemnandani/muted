import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { MessageRequestStatus, MessageStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const chatRouter = createTRPCRouter({
  getChats: privateProcedure.query(async ({ ctx }) => {
    try {
      const chats = await ctx.db.chat.findMany({
        where: {
          OR: [
            { senderId: ctx.userId },
            {
              receiverId: ctx.userId,
              messageRequest: false,
            },
          ],
          isActive: true,
          NOT: {
            chatDeletions: {
              some: {
                userId: ctx.userId,
              },
            },
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
          _count: {
            select: {
              messages: {
                where: {
                  senderId: { not: ctx.userId },
                  status: 'SENT',
                },
              },
            },
          },
          chatDeletions: {
            where: {
              userId: ctx.userId,
            },
          },
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      const messageRequests = await ctx.db.chat.findMany({
        where: {
          receiverId: ctx.userId,
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
              userId: ctx.userId,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const transformedChats = chats.map((chat) => {
        const userDeletion = chat.chatDeletions[0];

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
          unreadCount: chat._count.messages,
          messageRequest: chat.messageRequest,
          messageRequestStatus: chat.messageRequestStatus,
          requestedById: chat.requestedById,
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
    .input(z.object({ chatId: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const chat = await ctx.db.chat.findUnique({
          where: {
            id: input.chatId,
          },
          include: {
            chatDeletions: {
              where: {
                userId: ctx.userId,
              },
            },
          },
        });

        if (!chat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found',
          });
        }

        const userDeletion = chat.chatDeletions[0];

        const whereClause: any = { chatId: input.chatId };
        if (userDeletion) {
          whereClause.createdAt = {
            gt: userDeletion.deletedAt,
          };
        }

        const messages = await ctx.db.message.findMany({
          where: whereClause,
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
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        return { messages };
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
      try {
        const chat = await ctx.db.chat.findUnique({
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

        const existingDeletion = await ctx.db.chatDeletion.findUnique({
          where: {
            chatId_userId: {
              chatId: input.chatId,
              userId: ctx.userId,
            },
          },
        });

        if (existingDeletion) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Chat already deleted',
          });
        }

        await ctx.db.chatDeletion.create({
          data: {
            chatId: input.chatId,
            userId: ctx.userId,
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
      try {
        const chat = await ctx.db.chat.findUnique({
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

        await ctx.db.chatDeletion.upsert({
          where: {
            chatId_userId: {
              chatId: input.chatId,
              userId: ctx.userId,
            },
          },
          update: {
            deletedAt: new Date(),
          },
          create: {
            chatId: input.chatId,
            userId: ctx.userId,
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
      try {
        await ctx.db.chatDeletion.deleteMany({
          where: {
            chatId: input.chatId,
            userId: ctx.userId,
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
      try {
        let existingChat = await ctx.db.chat.findFirst({
          where: {
            OR: [
              { senderId: ctx.userId, receiverId: input.otherUserId },
              { senderId: input.otherUserId, receiverId: ctx.userId },
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
                userId: ctx.userId,
              },
            },
          },
        });

        if (existingChat) {
          if (existingChat.chatDeletions.length > 0) {
            await ctx.db.chatDeletion.deleteMany({
              where: {
                chatId: existingChat.id,
                userId: ctx.userId,
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

        const currentUser = await ctx.db.user.findUnique({
          where: { id: ctx.userId },
          include: {
            following: { where: { id: input.otherUserId } },
            followers: { where: { id: input.otherUserId } },
          },
        });

        if (!currentUser) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
        }

        const isFollowing = currentUser?.following.length > 0;
        const isFollowedBy = currentUser?.followers.length > 0;
        const areMutualFriends = isFollowing && isFollowedBy;

        const newChat = await ctx.db.chat.create({
          data: {
            senderId: ctx.userId,
            receiverId: input.otherUserId,
            messageRequest: !areMutualFriends,
            ...(!areMutualFriends && {
              messageRequestStatus: MessageRequestStatus.PENDING,
            }),
            requestedById: areMutualFriends ? null : ctx.userId,
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
      try {
        const chat = await ctx.db.chat.findUnique({
          where: { id: input.chatId },
        });

        if (!chat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found',
          });
        }

        if (chat.senderId !== ctx.userId && chat.receiverId !== ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Unauthorized access to chat',
          });
        }

        const updatedResult = await ctx.db.message.updateMany({
          where: {
            chatId: input.chatId,
            senderId: { not: ctx.userId },
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
      try {
        const chat = await ctx.db.chat.findUnique({
          where: { id: input.chatId },
        });

        if (!chat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found',
          });
        }

        if (chat.receiverId !== ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot accept this message request',
          });
        }

        await ctx.db.message.updateMany({
          where: {
            chatId: input.chatId,
            senderId: { not: ctx.userId },
          },
          data: {
            status: 'SEEN',
            readAt: new Date(),
          },
        });

        const updatedChat = await ctx.db.chat.update({
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
      try {
        const chat = await ctx.db.chat.findUnique({
          where: { id: input.chatId },
        });

        if (!chat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found',
          });
        }

        if (chat.receiverId !== ctx.userId) {
          throw new TRPCError({
            code: 'FORBIDDEN',
            message: 'Cannot decline this message request',
          });
        }

        await ctx.db.chat.update({
          where: { id: input.chatId },
          data: {
            messageRequestStatus: MessageRequestStatus.DECLINED,
            isActive: false,
          },
        });

        return { success: true };
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
});
