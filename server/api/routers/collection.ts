import { enrichMediaTokens, enrichThumbnailToken } from '@/lib/utils';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import {
  GET_MENTIONS,
  GET_REPOSTS,
  GET_USER,
  getBookmarksWithBlockFilter,
  getLikesWithBlockFilter,
} from '@/server/constants';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const collectionRouter = createTRPCRouter({
  createCollection: privateProcedure
    .input(
      z.object({
        name: z.string().min(1, { message: 'Name is required' }),
        privacy: z.enum(['PUBLIC', 'PRIVATE']),
        description: z.string().optional(),
        postId: z.string().optional(),
      }),
    )
    .mutation(
      async ({ input: { name, privacy, description, postId }, ctx }) => {
        const { userId, db } = ctx;

        // Get default collection
        const defaultCollection = await db.collection.findFirst({
          where: { userId, isDefault: true },
        });

        if (!defaultCollection) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Default collection not found',
          });
        }

        return await db.$transaction(async (tx) => {
          const createdCollection = await tx.collection.create({
            data: {
              name,
              privacy,
              description,
              userId,
            },
          });

          // Create bookmark in new collection

          if (postId) {
            const post = await db.post.findUnique({
              where: { id: postId },
            });

            if (!post) {
              throw new TRPCError({
                code: 'NOT_FOUND',
                message: 'Post not found',
              });
            }
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
                userId_postId_collectionId: {
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
          }

          return {
            success: true,
            warning: null,
            collection: createdCollection,
          };
        });
      },
    ),

  getUserCollections: privateProcedure
    .input(
      z.object({
        sortBy: z.enum(['LATEST', 'OLDEST']).default('LATEST'),
        username: z.string(),
        limit: z.number().optional().default(18),
        cursor: z
          .object({
            name: z.string(),
            userId: z.string(),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      const { sortBy, username, limit, cursor } = input;
      const orderBy = sortBy === 'LATEST' ? 'desc' : 'asc';

      const user = await db.user.findUnique({
        where: { username },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const isOwner = userId === user.id;

      const collections = await db.collection.findMany({
        take: limit + 1,
        cursor: cursor ? { name_userId: cursor } : undefined,
        where: {
          userId: user.id,
          ...(!isOwner && { privacy: 'PUBLIC' }),
        },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: orderBy },
          { id: orderBy },
        ],
        include: {
          bookmarks: {
            where: {
              post: {
                hiddenBy: {
                  none: {
                    userId,
                  },
                },
                author: {
                  mutedByUsers: {
                    none: {
                      mutedByUserId: userId,
                    },
                  },
                  blockedByUsers: {
                    none: {
                      blockingUserId: userId,
                    },
                  },
                  blockedUsers: {
                    none: {
                      blockedUserId: userId,
                    },
                  },
                },
              },
            },
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

      let nextCursor: typeof cursor | undefined;
      if (collections.length > limit) {
        const nextItem = collections[limit];
        nextCursor = {
          name: nextItem.name,
          userId: nextItem.userId,
        };
        collections.length = limit;
      }

      const formattedCollections = await Promise.all(
        collections.map(async (collection) => {
          const coverIndex = collection.isDefault
            ? collection.bookmarks.length - 1
            : 0;

          const bookmarks = await Promise.all(
            collection.bookmarks.map(async (bookmark, index) => {
              let media = bookmark.post?.media;

              if (index === coverIndex) {
                media = await enrichThumbnailToken(media);
              }

              return {
                id: bookmark.post!.id,
                media,
                author: bookmark.post!.author,
                text: bookmark.post!.text,
              };
            }),
          );

          return {
            id: collection.id,
            name: collection.name,
            description: collection.description,
            privacy: collection.privacy,
            isDefault: collection.isDefault,
            postsCount: collection.bookmarks.length,
            bookmarks,
          };
        }),
      );

      return {
        collections: formattedCollections,
        nextCursor,
      };
    }),

  toggleBookmark: privateProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(['POST', 'THREAD']),
        collectionId: z.string().optional(),
        isDefault: z.boolean().optional(),
        removeFromAll: z.boolean().optional(),
        intent: z.boolean().optional(),
      }),
    )
    .mutation(
      async ({
        input: { id, type, collectionId, isDefault, removeFromAll, intent },
        ctx,
      }) => {
        const { userId, db } = ctx;

        const isThread = type === 'THREAD';
        const targetField = isThread ? 'threadId' : 'postId';

        const defaultCollection = await db.collection.findFirst({
          where: { userId, isDefault: true },
        });

        if (!defaultCollection) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Default collection not found',
          });
        }

        if (removeFromAll) {
          await db.bookmark.deleteMany({
            where: { [targetField]: id, userId },
          });
          return { addedBookmark: false };
        }

        const uniqueWhere = isThread
          ? { userId_threadId: { userId, threadId: id } }
          : {
              userId_postId_collectionId: {
                userId,
                postId: id,
                collectionId: defaultCollection.id,
              },
            };

        if (isDefault) {
          const existingBookmark = await db.bookmark.findUnique({
            where: uniqueWhere,
          });

          const shouldBookmark =
            intent !== undefined ? intent : existingBookmark == null;
          const shouldRemove =
            intent !== undefined ? !intent : existingBookmark != null;

          if (shouldBookmark) {
            if (existingBookmark) return { addedBookmark: true };

            await db.bookmark.create({
              data: {
                [targetField]: id,
                userId,
                ...(isThread ? {} : { collectionId: defaultCollection.id }),
              },
            });
            return { addedBookmark: true };
          }
          if (shouldRemove) {
            if (!existingBookmark) return { addedBookmark: false };

            await db.bookmark.delete({
              where: uniqueWhere,
            });
            return { addedBookmark: false };
          }
        }

        if (!collectionId) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Collection ID is required',
          });
        }

        const existingBookmark = await db.bookmark.findUnique({
          where: uniqueWhere,
        });

        const shouldBookmarkCustom =
          intent !== undefined ? intent : existingBookmark == null;
        const shouldRemoveCustom =
          intent !== undefined ? !intent : existingBookmark != null;

        if (shouldBookmarkCustom) {
          if (existingBookmark) return { addedBookmark: true };

          await db.$transaction(async (tx) => {
            await tx.bookmark.create({
              data: {
                [targetField]: id,
                userId,
                ...(isThread ? {} : { collectionId }),
              },
            });

            await tx.bookmark.upsert({
              where: uniqueWhere,
              create: {
                [targetField]: id,
                userId,
                ...(isThread ? {} : { collectionId: defaultCollection.id }),
              },
              update: {},
            });
          });
          return { addedBookmark: true };
        }

        if (shouldRemoveCustom) {
          if (!existingBookmark) return { addedBookmark: false };

          await db.bookmark.delete({
            where: uniqueWhere,
          });
          return { addedBookmark: false };
        }

        return { addedBookmark: !!existingBookmark };
      },
    ),

  deleteCollection: privateProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input: { id }, ctx }) => {
      const { userId, db } = ctx;
      const collection = await db.collection.findUnique({
        where: { id, userId },
      });

      if (!collection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        });
      }

      await db.collection.delete({ where: { id } });

      return { success: true };
    }),

  editCollection: privateProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        description: z.string(),
        privacy: z.enum(['PUBLIC', 'PRIVATE']),
      }),
    )
    .mutation(async ({ input: { id, name, description, privacy }, ctx }) => {
      const { userId, db } = ctx;
      const collection = await db.collection.findUnique({
        where: { id, userId },
      });

      if (!collection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        });
      }

      await db.collection.update({
        where: { id },
        data: { name, description, privacy, createdAt: collection.createdAt },
      });
      return { success: true };
    }),

  getCollection: privateProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number().optional().default(20),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      }),
    )
    .query(async ({ input: { id, limit, cursor }, ctx }) => {
      if (!id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Collection ID is required',
        });
      }
      const { userId, db } = ctx;

      const collection = await db.collection.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          description: true,
          privacy: true,
          isDefault: true,
          bookmarks: {
            where: {
              post: {
                hiddenBy: {
                  none: {
                    userId,
                  },
                },
                author: {
                  mutedByUsers: {
                    none: {
                      mutedByUserId: userId,
                    },
                  },
                  blockedByUsers: {
                    none: {
                      blockingUserId: userId,
                    },
                  },
                  blockedUsers: {
                    none: {
                      blockedUserId: userId,
                    },
                  },
                },
              },
            },
            take: limit + 1,
            cursor: cursor
              ? {
                  userId_postId_collectionId: {
                    postId: cursor.id,
                    userId,
                    collectionId: id,
                  },
                }
              : undefined,
            select: {
              createdAt: true,
              post: {
                select: {
                  id: true,
                  createdAt: true,
                  text: true,
                  media: true,
                  parentPostId: true,
                  quoteId: true,
                  path: true,
                  repliesCount: true,
                  privacy: true,
                  author: {
                    select: {
                      ...GET_USER,
                    },
                  },
                  ...getLikesWithBlockFilter(userId),
                  ...getBookmarksWithBlockFilter(userId),
                  reposts: {
                    ...GET_REPOSTS,
                    orderBy: {
                      createdAt: 'desc',
                    },
                  },
                  ...GET_MENTIONS,
                },
              },
              user: {
                select: {
                  username: true,
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!collection) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Collection not found',
        });
      }

      const posts = await Promise.all(
        collection?.bookmarks.map(async (bookmark) => ({
          ...bookmark.post!,
          media: await enrichMediaTokens(bookmark.post?.media),
          likesCount: bookmark.post?.likes.length,
          repostsCount: bookmark.post?.reposts.length,
          bookmarksCount: new Set(
            bookmark.post?.bookmarks.map((bookmark) => bookmark.userId),
          ).size,
        })),
      );

      let nextCursor: typeof cursor | undefined;
      if (posts.length > limit) {
        const nextItem = posts[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        posts.length = limit;
      }

      return {
        collection: {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          privacy: collection.privacy,
          isDefault: collection.isDefault,
          username: collection?.bookmarks[0]?.user?.username,
        },
        posts,
        nextCursor,
      };
    }),
});
