import { PostMedia } from '@/lib/types';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const collectionRouter = createTRPCRouter({
  createCollection: privateProcedure
    .input(
      z.object({
        name: z.string().min(1, { message: 'Name is required' }),
        privacy: z.enum(['PUBLIC', 'PRIVATE']),
      })
    )
    .mutation(async ({ input: { name, privacy }, ctx }) => {
      const { userId } = ctx;

      const existingCollection = await ctx.db.collection.findUnique({
        where: {
          name_userId: {
            name,
            userId,
          },
        },
      });

      if (existingCollection) {
        return {
          success: false,
          warning: 'Collection with this name already exists',
          collection: null,
        };
      }

      const createdCollection = await ctx.db.collection.create({
        data: {
          name,
          privacy,
          userId,
        },
      });

      return {
        success: true,
        warning: null,
        collection: createdCollection,
      };
    }),

  getUserCollections: privateProcedure.query(async ({ ctx }) => {
    const { userId } = ctx;
    const collections = await ctx.db.collection.findMany({
      where: { userId },
      include: {
        bookmarks: {
          include: {
            post: {
              select: {
                id: true,
                media: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });
    const formattedCollections = collections.map((collection) => {
      return {
        ...collection,
        bookmarks: collection.bookmarks.map((bookmark) => ({
          id: bookmark.post.id,
          media: bookmark.post.media as PostMedia,
        })),
        postsCount: collection.bookmarks.length,
      };
    });

    return formattedCollections;
  }),

  toggleBookmark: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        collectionId: z.string().optional(),
        isDefault: z.boolean().optional(),
      })
    )
    .mutation(async ({ input: { postId, collectionId, isDefault }, ctx }) => {
      const { userId } = ctx;
      const targetCollectionId = await ctx.db.$transaction(async (tx) => {
        if (isDefault) {
          const defaultCollection = await tx.collection.findFirst({
            where: {
              userId,
              isDefault: true,
            },
          });

          if (!defaultCollection) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Default collection not found',
            });
          }

          return defaultCollection.id;
        }

        if (!collectionId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Collection ID is required for non-default collections',
          });
        }

        const collection = await tx.collection.findFirst({
          where: {
            id: collectionId,
            userId,
          },
        });

        if (!collection) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Collection not found',
          });
        }

        return collectionId;
      });

      const data = { postId, userId, collectionId: targetCollectionId };

      const existingBookmark = await ctx.db.bookmark.findUnique({
        where: {
          postId_userId_collectionId: data,
        },
      });

      if (!existingBookmark) {
        const transactionResult = await ctx.db.$transaction(async (prisma) => {
          const createdBookmark = await prisma.bookmark.create({
            data,
            select: {
              post: {
                select: {
                  text: true,
                  author: {
                    select: {
                      id: true,
                    },
                  },
                },
              },
            },
          });

          const createdNotification = await prisma.notification.create({
            data: {
              type: 'BOOKMARK',
              senderUserId: userId,
              receiverUserId: createdBookmark.post.author.id,
              postId,
              message: createdBookmark.post.text || '',
            },
          });

          return {
            createdBookmark,
            createdNotification,
          };
        });

        if (!transactionResult) {
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        }

        return { addedBookmark: true };
      } else {
        const transactionResult = await ctx.db.$transaction(async (prisma) => {
          const removeBookmark = await prisma.bookmark.delete({
            where: {
              postId_userId_collectionId: data,
            },
          });

          const notification = await prisma.notification.findFirst({
            where: {
              senderUserId: userId,
              postId,
              type: 'BOOKMARK',
            },
            select: {
              id: true,
            },
          });

          if (notification) {
            await prisma.notification.delete({
              where: {
                id: notification.id,
              },
            });
          }

          return {
            removeBookmark,
          };
        });

        if (!transactionResult) {
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        }

        return { addedBookmark: false };
      }
    }),
});
