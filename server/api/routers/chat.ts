import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';

export const chatRouter = createTRPCRouter({
  getChats: privateProcedure.query(async ({ ctx }) => {
    try {
      const chats = await ctx.db.chat.findMany({
        where: {
          OR: [{ user1Id: ctx.userId }, { user2Id: ctx.userId }],
          isActive: true,
        },
        include: {
          user1: {
            select: {
              id: true,
              username: true,
              fullName: true,
              image: true,
            },
          },
          user2: {
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
        },
        orderBy: { lastMessageAt: 'desc' },
      });

      const transformedChats = chats.map((chat) => ({
        id: chat.id,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        lastMessageAt: chat.lastMessageAt,
        participants: [chat.user1, chat.user2],
        lastMessage: chat.messages[0] || null,
        unreadCount: chat._count.messages,
      }));

      return { chats: transformedChats };
    } catch (error) {
      console.error('[GET_CHATS]', error);
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
        });

        if (!chat) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Chat not found',
          });
        }

        const messages = await ctx.db.message.findMany({
          where: { chatId: input.chatId },
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
          orderBy: { createdAt: 'asc' },
        });

        return { messages };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('[GET_MESSAGES]', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to fetch messages',
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
        const deleteTransaction = await ctx.db.$transaction(async (prisma) => {
          await prisma.message.deleteMany({
            where: { chatId: input.chatId },
          });

          const updatedChat = await prisma.chat.update({
            where: { id: input.chatId },
            data: { lastMessageAt: null },
            include: {
              user1: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  image: true,
                },
              },
              user2: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  image: true,
                },
              },
            },
          });

          return { updatedChat };
        });

        return { chat: deleteTransaction.updatedChat };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('[DELETE_MESSAGES]', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete messages',
        });
      }
    }),

  getOrCreateChat: privateProcedure
    .input(z.object({ otherUserId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        let chat = await ctx.db.chat.findFirst({
          where: {
            OR: [
              { user1Id: ctx.userId, user2Id: input.otherUserId },
              { user1Id: input.otherUserId, user2Id: ctx.userId },
            ],
          },
          include: {
            user1: {
              select: {
                id: true,
                username: true,
                fullName: true,
                image: true,
              },
            },
            user2: {
              select: {
                id: true,
                username: true,
                fullName: true,
                image: true,
              },
            },
          },
        });

        let isNew = false;

        if (!chat) {
          chat = await ctx.db.chat.create({
            data: {
              user1Id: ctx.userId,
              user2Id: input.otherUserId,
            },
            include: {
              user1: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  image: true,
                },
              },
              user2: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  image: true,
                },
              },
            },
          });
          isNew = true;
        }

        const transformedChat = {
          id: chat.id,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
          lastMessageAt: chat.lastMessageAt,
          participants: [chat.user1, chat.user2],
          lastMessage: null,
          unreadCount: 0,
        };

        return { chat: transformedChat, isNew };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        console.error('[GET_OR_CREATE_CHAT]', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to get or create chat',
        });
      }
    }),
});
