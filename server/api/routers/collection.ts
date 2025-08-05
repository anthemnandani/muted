import { PostMedia } from '@/lib/types';
import { getTotalRepliesCount } from '@/lib/utils';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import {
  GET_LINK_PREVIEW,
  GET_MENTIONS,
  GET_REPOSTS,
  GET_USER,
  getBookmarksWithBlockFilter,
  getLikesWithBlockFilter,
  getPostRepliesCount,
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
      })
    )
    .mutation(
      async ({ input: { name, privacy, description, postId }, ctx }) => {
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

          if (postId) {
            const post = await ctx.db.post.findUnique({
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
          }

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
        sortBy: z.enum(['LATEST', 'OLDEST']).default('LATEST'),
        username: z.string(),
        limit: z.number().optional().default(21),
        cursor: z
          .object({
            name: z.string(),
            userId: z.string(),
          })
          .optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { sortBy, username, limit, cursor } = input;
      const orderBy = sortBy === 'LATEST' ? 'desc' : 'asc';

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
                    userId: ctx.userId,
                  },
                },
                author: {
                  mutedByUsers: {
                    none: {
                      mutedByUserId: ctx.userId,
                    },
                  },
                  blockedByUsers: {
                    none: {
                      blockingUserId: ctx.userId,
                    },
                  },
                  blockedUsers: {
                    none: {
                      blockedUserId: ctx.userId,
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
                  threadText: true,
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

      const formattedCollections = collections.map((collection) => {
        return {
          id: collection.id,
          name: collection.name,
          description: collection.description,
          privacy: collection.privacy,
          isDefault: collection.isDefault,
          bookmarks: collection.bookmarks.map((bookmark) => ({
            id: bookmark.post.id,
            media: bookmark.post.media as PostMedia[],
            author: bookmark.post.author,
            text: bookmark.post.text,
          })),
          postsCount: collection.bookmarks.length,
        };
      });

      return {
        collections: formattedCollections,
        nextCursor,
      };
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
      })
    )
    .query(async ({ input: { id, limit, cursor }, ctx }) => {
      const collection = await ctx.db.collection.findUnique({
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
                    userId: ctx.userId,
                  },
                },
                author: {
                  mutedByUsers: {
                    none: {
                      mutedByUserId: ctx.userId,
                    },
                  },
                  blockedByUsers: {
                    none: {
                      blockingUserId: ctx.userId,
                    },
                  },
                  blockedUsers: {
                    none: {
                      blockedUserId: ctx.userId,
                    },
                  },
                },
              },
            },
            take: limit + 1,
            cursor: cursor
              ? {
                  postId_userId_collectionId: {
                    postId: cursor.id,
                    userId: ctx.userId,
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
                  threadText: true,
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
                  ...getLikesWithBlockFilter(ctx.userId),
                  ...getBookmarksWithBlockFilter(ctx.userId),
                  reposts: {
                    ...GET_REPOSTS,
                    orderBy: {
                      createdAt: 'desc',
                    },
                  },
                  ...GET_MENTIONS,
                  ...GET_LINK_PREVIEW,
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

      const posts = collection?.bookmarks.map((bookmark) => ({
        ...bookmark.post,
        media: bookmark.post.media as PostMedia[],
        likesCount: bookmark.post.likes.length,
        repostsCount: bookmark.post.reposts.length,
        bookmarksCount: new Set(
          bookmark.post.bookmarks.map((bookmark) => bookmark.userId)
        ).size,
        type: 'post' as const,
      }));

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

  getCollectionPosts: privateProcedure
    .input(
      z.object({
        id: z.string().nullable(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!input.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Collection ID is required',
        });
      }

      const collection = await ctx.db.collection.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          user: {
            select: {
              username: true,
            },
          },
          bookmarks: {
            where: {
              post: {
                hiddenBy: {
                  none: {
                    userId: ctx.userId,
                  },
                },
                author: {
                  mutedByUsers: {
                    none: {
                      mutedByUserId: ctx.userId,
                    },
                  },
                  blockedByUsers: {
                    none: {
                      blockingUserId: ctx.userId,
                    },
                  },
                  blockedUsers: {
                    none: {
                      blockedUserId: ctx.userId,
                    },
                  },
                },
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            select: {
              post: {
                select: {
                  id: true,
                  createdAt: true,
                  text: true,
                  threadText: true,
                  media: true,
                  parentPostId: true,
                  quoteId: true,
                  path: true,
                  repliesCount: true,
                  hideLikes: true,
                  turnOffComments: true,
                  privacy: true,
                  author: {
                    select: {
                      ...GET_USER,
                      blockedUsers: {
                        select: {
                          blockedUserId: true,
                        },
                      },
                    },
                  },
                  ...getLikesWithBlockFilter(ctx.userId),
                  ...getBookmarksWithBlockFilter(ctx.userId),
                  ...getPostRepliesCount(ctx.userId),
                  reposts: {
                    ...GET_REPOSTS,
                    orderBy: {
                      createdAt: 'desc',
                    },
                  },
                  ...GET_MENTIONS,
                  ...GET_LINK_PREVIEW,
                },
              },
            },
          },
        },
      });

      if (!collection) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const blockedUsers = collection.bookmarks[0].post.author.blockedUsers.map(
        (blockedUser) => blockedUser.blockedUserId
      );

      const isBlocked = blockedUsers.includes(ctx.userId);

      if (isBlocked) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const posts = collection.bookmarks.map((bookmark) => ({
        ...bookmark.post,
        media: bookmark.post.media as PostMedia[],
        likesCount: bookmark.post.likes.length,
        repostsCount: bookmark.post.reposts.length,
        repliesCount: getTotalRepliesCount(bookmark.post) as number,
        bookmarksCount: new Set(
          bookmark.post.bookmarks.map((bookmark) => bookmark.userId)
        ).size,
        type: 'post' as const,
      }));

      return posts;
    }),
});
