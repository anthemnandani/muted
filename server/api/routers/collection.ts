import { PostMedia } from '@/lib/types';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { GET_USER } from '@/server/constants';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const collectionRouter = createTRPCRouter({
  createCollection: privateProcedure
    .input(
      z.object({
        name: z.string().min(1, { message: 'Name is required' }),
        privacy: z.enum(['PUBLIC', 'PRIVATE']),
        description: z.string().optional(),
        postId: z.string(),
      })
    )
    .mutation(
      async ({ input: { name, privacy, description, postId }, ctx }) => {
        const { userId } = ctx;

        const post = await ctx.db.post.findUnique({
          where: { id: postId },
        });

        if (!post) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Post not found',
          });
        }

        // Get default collection
        const defaultCollection = await ctx.db.collection.findFirst({
          where: { userId, isDefault: true },
        });

        if (!defaultCollection) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Default collection not found',
          });
        }

        return await ctx.db.$transaction(async (tx) => {
          const createdCollection = await tx.collection.create({
            data: {
              name,
              privacy,
              description,
              userId,
            },
          });

          // Create bookmark in new collection
          await tx.bookmark.create({
            data: {
              postId,
              userId,
              collectionId: createdCollection.id,
            },
          });

          // Add to default collection using upsert to prevent duplicates
          await tx.bookmark.upsert({
            where: {
              postId_userId_collectionId: {
                postId,
                userId,
                collectionId: defaultCollection.id,
              },
            },
            create: {
              postId,
              userId,
              collectionId: defaultCollection.id,
            },
            update: {}, // Do nothing if exists
          });

          return {
            success: true,
            warning: null,
            collection: createdCollection,
          };
        });
      }
    ),

  getUserCollections: privateProcedure
    .input(
      z.object({
        sortBy: z.enum(['latest', 'oldest']).default('latest'),
        username: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { sortBy, username } = input;
      const orderBy = sortBy === 'latest' ? 'desc' : 'asc';

      const user = await ctx.db.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const isOwner = ctx.userId === user.id;

      const collections = await ctx.db.collection.findMany({
        where: {
          userId: user.id,
          ...(!isOwner && { privacy: 'PUBLIC' }),
        },
        include: {
          bookmarks: {
            include: {
              post: {
                select: {
                  id: true,
                  media: true,
                  text: true,
                  author: {
                    select: {
                      ...GET_USER,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: orderBy,
            },
          },
        },
      });

      const formattedCollections = collections.map((collection) => {
        return {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          privacy: collection.privacy,
          isDefault: collection.isDefault,
          bookmarks: collection.bookmarks.map((bookmark) => ({
            id: bookmark.post.id,
            media: bookmark.post.media as PostMedia,
            author: bookmark.post.author,
            text: bookmark.post.text,
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
        removeFromAll: z.boolean().optional(),
      })
    )
    .mutation(
      async ({
        input: { postId, collectionId, isDefault, removeFromAll },
        ctx,
      }) => {
        const { userId } = ctx;

        // Get default collection
        const defaultCollection = await ctx.db.collection.findFirst({
          where: { userId, isDefault: true },
        });

        if (!defaultCollection) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Default collection not found',
          });
        }

        // Case 1: Remove from all collections
        if (removeFromAll) {
          await ctx.db.bookmark.deleteMany({
            where: { postId, userId },
          });
          return { addedBookmark: false };
        }

        // Case 2: Default collection operation (bookmark button click)
        if (isDefault) {
          const existingBookmark = await ctx.db.bookmark.findUnique({
            where: {
              postId_userId_collectionId: {
                postId,
                userId,
                collectionId: defaultCollection.id,
              },
            },
          });

          if (!existingBookmark) {
            // Add to default collection
            await ctx.db.bookmark.create({
              data: {
                postId,
                userId,
                collectionId: defaultCollection.id,
              },
            });
            return { addedBookmark: true };
          } else {
            // Remove from default collection
            await ctx.db.bookmark.delete({
              where: {
                postId_userId_collectionId: {
                  postId,
                  userId,
                  collectionId: defaultCollection.id,
                },
              },
            });
            return { addedBookmark: false };
          }
        }

        // Case 3: Non-default collection operation
        if (!collectionId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Collection ID is required',
          });
        }

        const existingBookmark = await ctx.db.bookmark.findUnique({
          where: {
            postId_userId_collectionId: {
              postId,
              userId,
              collectionId,
            },
          },
        });

        if (!existingBookmark) {
          await ctx.db.$transaction(async (tx) => {
            // Add to selected collection
            await tx.bookmark.create({
              data: {
                postId,
                userId,
                collectionId,
              },
            });

            // Add to default collection if not already there
            await tx.bookmark.upsert({
              where: {
                postId_userId_collectionId: {
                  postId,
                  userId,
                  collectionId: defaultCollection.id,
                },
              },
              create: {
                postId,
                userId,
                collectionId: defaultCollection.id,
              },
              update: {}, // Do nothing if exists
            });
          });
          return { addedBookmark: true };
        } else {
          // Remove from selected collection only
          await ctx.db.bookmark.delete({
            where: {
              postId_userId_collectionId: {
                postId,
                userId,
                collectionId,
              },
            },
          });
          return { addedBookmark: false };
        }
      }
    ),

  deleteCollection: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const { userId } = ctx;
      const collection = await ctx.db.collection.findUnique({
        where: { id, userId },
      });

      if (!collection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        });
      }

      await ctx.db.collection.delete({ where: { id } });

      return { success: true };
    }),

  editCollection: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        privacy: z.enum(['PUBLIC', 'PRIVATE']),
      })
    )
    .mutation(async ({ input: { id, name, description, privacy }, ctx }) => {
      const { userId } = ctx;
      const collection = await ctx.db.collection.findUnique({
        where: { id, userId },
      });

      if (!collection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        });
      }

      await ctx.db.collection.update({
        where: { id },
        data: { name, description, privacy, createdAt: collection.createdAt },
      });
      return { success: true };
    }),
});
