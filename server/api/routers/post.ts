import type { PostMedia } from '@/lib/types';
import { extractHashtags, getUserEmail } from '@/lib/utils';
import {
  GET_BOOKMARKS,
  GET_COUNT,
  GET_LIKES,
  GET_LINK_PREVIEW,
  GET_MENTIONS,
  GET_REPOSTS,
  GET_USER,
  getAuthorAndHiddenSelect,
} from '@/server/constants';
import { createId } from '@paralleldrive/cuid2';
import { NotificationType, PostPrivacy } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { Filter } from 'bad-words';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '../trpc';

export const postRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        text: z.string().optional(),
        media: z
          .array(
            z.object({
              fileType: z.string(),
              fileUrl: z.string(),
              aspectRatio: z.string().optional(),
              thumbnailUrl: z.string().optional(),
              originalDimensions: z.object({
                width: z.number(),
                height: z.number(),
              }),
            })
          )
          .optional(),
        mentions: z
          .array(
            z.object({
              userId: z.string(),
              index: z.number(),
            })
          )
          .optional(),
        privacy: z.nativeEnum(PostPrivacy).default('ANYONE'),
        quoteId: z.string().optional(),
        postAuthor: z.string().optional(),
        parentPostId: z.string().optional(),
        linkPreview: z
          .object({
            url: z.string(),
            title: z.string().nullable().optional(),
            description: z.string().nullable().optional(),
            image: z.string().nullable().optional(),
          })
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user, userId } = ctx;
      const email = getUserEmail(user);
      const dbUser = await ctx.db.user.findUnique({
        where: {
          email: email,
        },
        select: {
          verified: true,
        },
      });

      if (!dbUser) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const filter = new Filter();
      const filteredText = filter.clean(input.text || '');
      const hashtags = extractHashtags(filteredText);

      const transactionResult = await ctx.db.$transaction(async (prisma) => {
        let linkPreview;

        if (input.linkPreview) {
          linkPreview = await prisma.linkPreview.upsert({
            where: { url: input.linkPreview.url },
            update: {},
            create: {
              url: input.linkPreview.url,
              title: input.linkPreview.title,
              description: input.linkPreview.description,
              image: input.linkPreview.image,
            },
          });
        }

        const postId = createId();
        const path = `/${postId}/`;

        const newpost = await prisma.post.create({
          data: {
            id: postId,
            text: filteredText,
            authorId: userId,
            media: input.media,
            privacy: input.privacy,
            quoteId: input.quoteId,
            path,
            linkPreviewUrl: linkPreview?.url,
            hashtags: {
              connectOrCreate: hashtags.map((tag) => {
                const tagName = tag.slice(1);
                return {
                  where: { name: tagName },
                  create: { name: tagName },
                };
              }),
            },
            mentions: input.mentions
              ? {
                  create: input.mentions.map((mention) => ({
                    userId: mention.userId,
                    index: mention.index,
                  })),
                }
              : undefined,
          },
          select: {
            id: true,
            author: true,
          },
        });

        if (input.postAuthor && userId !== input.postAuthor) {
          await prisma.notification.create({
            data: {
              type: 'QUOTE',
              senderUserId: userId,
              receiverUserId: input.postAuthor,
              postId: newpost.id,
              message: filteredText,
            },
          });
        }

        if (input.mentions?.length) {
          await Promise.all(
            input.mentions.map((mention) =>
              prisma.notification.create({
                data: {
                  type: 'MENTION',
                  senderUserId: userId,
                  receiverUserId: mention.userId,
                  postId: newpost.id,
                  message: filteredText,
                },
              })
            )
          );
        }

        return {
          newpost,
        };
      });

      if (!transactionResult) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
      }

      return {
        createPost: transactionResult.newpost,
        success: true,
      };
    }),

  getInfinitePosts: privateProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
        sortBy: z.enum(['LATEST', 'TOP']).optional().default('LATEST'),
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      })
    )
    .query(
      async ({ input: { limit = 20, cursor, searchQuery, sortBy }, ctx }) => {
        const posts = await ctx.db.post.findMany({
          where: {
            AND: [
              {
                parentPostId: null,
              },
              searchQuery
                ? {
                    OR: [
                      { text: { contains: searchQuery, mode: 'insensitive' } },
                      {
                        hashtags: {
                          some: {
                            name: {
                              contains: searchQuery,
                              mode: 'insensitive',
                            },
                          },
                        },
                      },
                    ],
                  }
                : {},
              {
                hiddenBy: {
                  none: {
                    userId: ctx.userId,
                  },
                },
              },
              {
                author: {
                  mutedByUsers: {
                    none: {
                      mutedByUserId: ctx.userId,
                    },
                  },
                },
              },
            ],
          },
          take: limit + 1,
          cursor: cursor ? { createdAt_id: cursor } : undefined,
          orderBy:
            sortBy === 'TOP'
              ? [{ likes: { _count: 'desc' } }, { createdAt: 'desc' }]
              : [{ createdAt: 'desc' }, { id: 'desc' }],
          select: {
            id: true,
            createdAt: true,
            text: true,
            media: true,
            parentPostId: true,
            quoteId: true,
            path: true,
            hideLikes: true,
            pinned: true,
            privacy: true,
            author: {
              select: {
                ...GET_USER,
              },
            },
            ...GET_LIKES,
            ...GET_BOOKMARKS,
            ...GET_COUNT,
            ...GET_MENTIONS,
            ...GET_LINK_PREVIEW,
            reposts: {
              ...GET_REPOSTS,
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        });

        const formattedPosts = posts.map((post) => ({
          ...post,
          media: post.media as PostMedia[],
          likesCount: post._count.likes,
          repostsCount: post._count.reposts,
          repliesCount: post._count.replies,
          bookmarksCount: new Set(
            post.bookmarks.map((bookmark) => bookmark.userId)
          ).size,
          type: 'post' as const,
        }));

        let nextCursor: typeof cursor | undefined;
        if (formattedPosts.length > limit) {
          const nextItem = formattedPosts[limit];
          nextCursor = {
            id: nextItem.id,
            createdAt: nextItem.createdAt,
          };
          formattedPosts.length = limit;
        }

        return {
          posts: formattedPosts,
          nextCursor,
        };
      }
    ),

  replyToPost: privateProcedure
    .input(
      z.object({
        postAuthor: z.string(),
        postId: z.string(),
        text: z.string().min(1, {
          message: 'Comment cannot be empty',
        }),
        mentions: z
          .array(
            z.object({
              userId: z.string(),
              index: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user, userId } = ctx;
      const email = getUserEmail(user);

      const transactionResult = await ctx.db.$transaction(async (prisma) => {
        const dbUser = await prisma.user.findUnique({
          where: { email },
          select: { verified: true },
        });

        if (!dbUser) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const filter = new Filter();
        const filteredText = filter.clean(input.text);

        const postId = createId();

        const parentPost = await prisma.post.findUnique({
          where: { id: input.postId },
          select: { path: true, id: true },
        });

        if (!parentPost) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Parent post not found',
          });
        }

        const parentPath = parentPost.path ?? `/${parentPost.id}`;
        const path = `${parentPath}${postId}/`;
        const ancestorIds = parentPath.split('/').filter(Boolean);

        await prisma.post.updateMany({
          where: { id: { in: ancestorIds } },
          data: { repliesCount: { increment: 1 } },
        });

        const repliedPost = await prisma.post.create({
          data: {
            id: postId,
            text: filteredText,
            authorId: userId,
            parentPostId: input.postId,
            path,
            mentions: input.mentions
              ? {
                  create: input.mentions.map((mention) => ({
                    userId: mention.userId,
                    index: mention.index,
                  })),
                }
              : undefined,
          },
          select: {
            id: true,
            author: true,
          },
        });

        if (userId !== input.postAuthor) {
          await prisma.notification.create({
            data: {
              type: 'REPLY',
              senderUserId: userId,
              receiverUserId: input.postAuthor,
              postId: input.postId,
              message: input.text,
            },
          });
        }

        if (input.mentions?.length) {
          await Promise.all(
            input.mentions.map((mention) =>
              prisma.notification.create({
                data: {
                  type: 'MENTION',
                  senderUserId: userId,
                  receiverUserId: mention.userId,
                  postId: repliedPost.id,
                  message: filteredText,
                },
              })
            )
          );
        }

        return { repliedPost };
      });

      if (!transactionResult) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
      }

      return {
        createPost: transactionResult.repliedPost,
        success: true,
      };
    }),

  getPostDetails: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;

      const post = await ctx.db.post.findUnique({
        where: { id },
        select: {
          id: true,
          createdAt: true,
          text: true,
          media: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          repliesCount: true,
          hideLikes: true,
          pinned: true,
          privacy: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...GET_LIKES,
          ...GET_BOOKMARKS,
          ...GET_COUNT,
          reposts: {
            ...GET_REPOSTS,
            orderBy: {
              createdAt: 'desc',
            },
          },
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
        },
      });

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }

      return {
        post: {
          ...post,
          media: post.media as PostMedia[],
          likesCount: post._count.likes,
          repostsCount: post._count.reposts,
          bookmarksCount: new Set(
            post.bookmarks.map((bookmark) => bookmark.userId)
          ).size,
          type: 'post' as const,
        },
      };
    }),

  getComments: publicProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number().optional().default(10),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id, limit, cursor } = input;

      const comments = await ctx.db.post.findMany({
        where: {
          parentPostId: id,
        },
        take: limit + 1,
        skip: 0,
        cursor: cursor ? { id: cursor.id } : undefined,
        select: {
          id: true,
          createdAt: true,
          text: true,
          media: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          hideLikes: true,
          pinned: true,
          privacy: true,
          reposts: {
            ...GET_REPOSTS,
            orderBy: {
              createdAt: 'desc',
            },
          },
          ...getAuthorAndHiddenSelect(ctx.userId!),
          ...GET_LIKES,
          ...GET_BOOKMARKS,
          ...GET_COUNT,
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
        },
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (comments.length > limit) {
        const nextItem = comments[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        comments.pop();
      }

      const formattedComments = comments.map((comment) => ({
        ...comment,
        media: comment.media as PostMedia[],
        likesCount: comment._count.likes,
        repostsCount: comment._count.reposts,
        repliesCount: comment._count.replies,
        bookmarksCount: new Set(
          comment.bookmarks.map((bookmark) => bookmark.userId)
        ).size,
        type: 'post' as const,
        isHidden: comment.hiddenBy.length > 0,
        isMuted: comment.author.mutedByUsers?.length > 0,
      }));

      return {
        comments: formattedComments,
        nextCursor,
      };
    }),

  toggleRepost: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input: { id }, ctx }) => {
      const { userId } = ctx;

      const data = { postId: id, userId };

      const existingRepost = await ctx.db.repost.findUnique({
        where: {
          postId_userId: data,
        },
      });

      if (existingRepost == null) {
        const transactionResult = await ctx.db.$transaction(async (prisma) => {
          const createdRepost = await prisma.repost.create({
            data,
            select: {
              post: {
                select: {
                  text: true,
                  authorId: true,
                },
              },
            },
          });

          const createNotification = await prisma.notification.create({
            data: {
              type: 'REPOST',
              postId: data.postId,
              message: createdRepost.post.text || '',
              senderUserId: userId,
              receiverUserId: createdRepost.post.authorId,
            },
          });

          return {
            createdRepost,
            createNotification,
          };
        });

        if (!transactionResult) {
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        }

        return { createdRepost: true };
      } else {
        const transactionResult = await ctx.db.$transaction(async (prisma) => {
          const removeRepost = await prisma.repost.delete({
            where: {
              postId_userId: data,
            },
          });

          const notification = await prisma.notification.findFirst({
            where: {
              senderUserId: userId,
              postId: data.postId,
              type: 'REPOST',
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
            removeRepost,
          };
        });

        if (!transactionResult) {
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        }

        return { createdRepost: false };
      }
    }),

  toggleHideLikes: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        hide: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const post = await ctx.db.post.findUnique({
        where: { id: input.postId },
        select: { authorId: true },
      });

      if (!post || post.authorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await ctx.db.post.update({
        where: { id: input.postId },
        data: { hideLikes: input.hide },
      });

      return { success: true };
    }),

  getQuotedPost: publicProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const postInfo = await ctx.db.post.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          createdAt: true,
          text: true,
          media: true,
          path: true,
          repliesCount: true,
          privacy: true,
          author: {
            select: {
              ...GET_USER,
            },
          },

          ...GET_LIKES,
          ...GET_COUNT,
          ...GET_LINK_PREVIEW,
          ...GET_MENTIONS,
        },
      });

      if (!postInfo) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return {
        postInfo: {
          id: postInfo.id,
          text: postInfo.text,
          createdAt: postInfo.createdAt,
          likeCount: postInfo._count.likes,
          user: postInfo.author,
          likes: postInfo.likes,
          repliesCount: postInfo.repliesCount,
          media: postInfo.media as PostMedia[],
          linkPreview: postInfo.linkPreview,
          mentions: postInfo.mentions,
        },
      };
    }),

  deletePost: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;
      const transactionResult = await ctx.db.$transaction(async (prisma) => {
        const postInfo = await prisma.post.delete({
          where: {
            id: input.id,
            authorId: userId,
          },
          select: {
            id: true,
          },
        });

        if (!postInfo) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        await prisma.post.updateMany({
          where: {
            quoteId: input.id,
          },
          data: {
            quoteId: null,
          },
        });

        return { success: true };
      });

      if (!transactionResult) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
      }

      return { success: true };
    }),

  deleteRepost: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;

      const data = { postId: input.id, userId };
      const transactionResult = await ctx.db.$transaction(async (prisma) => {
        await prisma.repost.delete({
          where: {
            postId_userId: data,
          },
        });

        return { success: true };
      });

      if (!transactionResult) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
      }

      return { success: true };
    }),

  getSavedPosts: privateProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z
          .object({
            postId: z.string(),
            userId: z.string(),
            collectionId: z.string(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId } = ctx;

      const collections = await ctx.db.collection.findMany({
        where: {
          userId,
        },
        select: {
          id: true,
          bookmarks: {
            where: {
              post: {
                AND: [
                  {
                    hiddenBy: {
                      none: {
                        userId: ctx.userId,
                      },
                    },
                  },
                  {
                    author: {
                      mutedByUsers: {
                        none: {
                          mutedByUserId: ctx.userId,
                        },
                      },
                    },
                  },
                ],
              },
            },
            orderBy: {
              createdAt: 'desc',
            },
            take: cursor ? undefined : limit + 1,
            cursor: cursor
              ? {
                  postId_userId_collectionId: {
                    postId: cursor.postId,
                    userId: cursor.userId,
                    collectionId: cursor.collectionId,
                  },
                }
              : undefined,
            select: {
              createdAt: true,
              collectionId: true,
              post: {
                select: {
                  id: true,
                  text: true,
                  createdAt: true,
                  media: true,
                  parentPostId: true,
                  parentPost: {
                    select: {
                      id: true,
                      author: {
                        select: {
                          ...GET_USER,
                        },
                      },
                    },
                  },
                  quoteId: true,
                  path: true,
                  hideLikes: true,
                  pinned: true,
                  privacy: true,
                  author: {
                    select: {
                      ...GET_USER,
                    },
                  },
                  ...GET_LIKES,
                  reposts: {
                    ...GET_REPOSTS,
                    orderBy: {
                      createdAt: 'desc',
                    },
                  },
                  ...GET_COUNT,
                  ...GET_BOOKMARKS,
                  ...GET_MENTIONS,
                  ...GET_LINK_PREVIEW,
                },
              },
            },
          },
        },
      });

      const allBookmarks = collections
        .flatMap((collection) => collection.bookmarks)
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      let nextCursor: typeof cursor | undefined;
      if (allBookmarks.length > limit) {
        const nextItem = allBookmarks[limit];
        nextCursor = {
          postId: nextItem.post.id,
          userId,
          collectionId: nextItem.collectionId,
        };
        allBookmarks.length = limit;
      }

      return {
        posts: allBookmarks.map((bookmark) => ({
          ...bookmark.post,
          media: bookmark.post.media as PostMedia[],
          likesCount: bookmark.post._count.likes,
          repostsCount: bookmark.post._count.reposts,
          repliesCount: bookmark.post._count.replies,
          bookmarksCount: new Set(
            bookmark.post.bookmarks.map((bookmark) => bookmark.userId)
          ).size,
        })),
        nextCursor,
      };
    }),

  getLikedPosts: privateProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z
          .object({
            postId: z.string(),
            userId: z.string(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId } = ctx;
      const likedPosts = await ctx.db.like.findMany({
        where: {
          userId,
          post: {
            AND: [
              {
                hiddenBy: {
                  none: {
                    userId: ctx.userId,
                  },
                },
              },
              {
                author: {
                  mutedByUsers: {
                    none: {
                      mutedByUserId: ctx.userId,
                    },
                  },
                },
              },
            ],
          },
        },
        take: limit + 1,
        cursor: cursor
          ? { postId_userId: { postId: cursor.postId, userId } }
          : undefined,
        select: {
          post: {
            select: {
              id: true,
              text: true,
              createdAt: true,
              media: true,
              parentPostId: true,
              parentPost: {
                select: {
                  id: true,
                  author: {
                    select: {
                      ...GET_USER,
                    },
                  },
                },
              },
              quoteId: true,
              path: true,
              hideLikes: true,
              pinned: true,
              privacy: true,
              author: {
                select: {
                  ...GET_USER,
                },
              },
              ...GET_LIKES,
              reposts: {
                ...GET_REPOSTS,
                orderBy: {
                  createdAt: 'desc',
                },
              },
              ...GET_COUNT,
              ...GET_BOOKMARKS,
              ...GET_MENTIONS,
              ...GET_LINK_PREVIEW,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (likedPosts.length > limit) {
        const nextItem = likedPosts[limit];
        nextCursor = {
          postId: nextItem.post.id,
          userId,
        };
        likedPosts.length = limit;
      }
      return {
        posts: likedPosts.map((likedPost) => ({
          ...likedPost.post,
          media: likedPost.post.media as PostMedia[],
          likesCount: likedPost.post._count.likes,
          repostsCount: likedPost.post._count.reposts,
          repliesCount: likedPost.post._count.replies,
          bookmarksCount: new Set(
            likedPost.post.bookmarks.map((bookmark) => bookmark.userId)
          ).size,
        })),
        nextCursor,
      };
    }),

  getFollowingPosts: privateProcedure
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

      const followingPosts = await ctx.db.post.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  author: {
                    followers: {
                      some: { id: userId },
                    },
                  },
                },
                {
                  reposts: {
                    some: {
                      user: {
                        followers: {
                          some: { id: userId },
                        },
                      },
                    },
                  },
                },
              ],
            },
            { parentPostId: null },
          ],
        },
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          text: true,
          createdAt: true,
          media: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          hideLikes: true,
          pinned: true,
          privacy: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          reposts: {
            ...GET_REPOSTS,
            orderBy: {
              createdAt: 'desc',
            },
          },
          ...GET_LIKES,
          ...GET_BOOKMARKS,
          ...GET_COUNT,
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (followingPosts.length > limit) {
        const nextItem = followingPosts[limit - 1];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        followingPosts.pop();
      }

      const formattedPosts = followingPosts.map((post) => {
        const followedUserRepost = post.reposts.find((repost) =>
          repost.user.followers.some((follower) => follower.id === userId)
        );

        return {
          ...post,
          media: post.media as PostMedia[],
          likesCount: post._count.likes,
          repostsCount: post._count.reposts,
          repliesCount: post._count.replies,
          bookmarksCount: new Set(
            post.bookmarks.map((bookmark) => bookmark.userId)
          ).size,
          type: followedUserRepost ? ('repost' as const) : ('post' as const),
          repostedBy: followedUserRepost?.user,
          repostedAt: followedUserRepost?.createdAt,
        };
      });

      const sortedPosts = formattedPosts.sort((a, b) => {
        const aTime =
          a.type === 'repost' ? a.repostedAt!.getTime() : a.createdAt.getTime();
        const bTime =
          b.type === 'repost' ? b.repostedAt!.getTime() : b.createdAt.getTime();
        return bTime - aTime;
      });

      return {
        posts: sortedPosts,
        nextCursor,
      };
    }),

  getPostsByTag: publicProcedure
    .input(
      z.object({
        tag: z.string(),
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { tag, limit = 20, cursor }, ctx }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          hashtags: {
            some: {
              name: tag.toLowerCase(),
            },
          },
          OR: [
            { parentPostId: null },
            {
              AND: [{ parentPostId: { not: null } }, { reposts: { some: {} } }],
            },
          ],
          AND: [
            {
              hiddenBy: {
                none: {
                  userId: ctx.userId,
                },
              },
            },
            {
              author: {
                mutedByUsers: {
                  none: {
                    mutedByUserId: ctx.userId,
                  },
                },
              },
            },
          ],
        },
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          createdAt: true,
          text: true,
          media: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          hideLikes: true,
          pinned: true,
          privacy: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...GET_LIKES,
          ...GET_BOOKMARKS,
          ...GET_COUNT,
          reposts: {
            ...GET_REPOSTS,
            orderBy: {
              createdAt: 'desc',
            },
          },
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
        },
      });

      const formattedPosts = posts.map((post) => ({
        ...post,
        media: post.media as PostMedia[],
        likesCount: post._count.likes,
        repostsCount: post._count.reposts,
        repliesCount: post._count.replies,
        bookmarksCount: new Set(
          post.bookmarks.map((bookmark) => bookmark.userId)
        ).size,
        type: 'post' as const,
      }));

      let nextCursor: typeof cursor | undefined;

      if (formattedPosts.length > limit) {
        const nextItem = formattedPosts[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        formattedPosts.length = limit;
      }

      return {
        posts: formattedPosts,
        nextCursor,
      };
    }),

  editPost: privateProcedure
    .input(
      z.object({
        id: z.string(),
        text: z.string().min(1, {
          message: 'Text must be at least 1 character',
        }),
        mentions: z
          .array(
            z.object({
              userId: z.string(),
              index: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        select: {
          authorId: true,
          createdAt: true,
          mentions: {
            select: {
              userId: true,
            },
          },
          hashtags: {
            select: {
              name: true,
            },
          },
          text: true,
        },
      });

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      if (post.authorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
      if (post.createdAt < fifteenMinutesAgo) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Edit window has expired',
        });
      }

      const filter = new Filter();
      const filteredText = filter.clean(input.text);

      const hashtags = extractHashtags(filteredText);

      const existingMentionUserIds = new Set(
        post.mentions.map((mention) => mention.userId)
      );

      const newMentionUserIds = new Set(
        input.mentions?.map((mention) => mention.userId) ?? []
      );

      const transactionResult = await ctx.db.$transaction(async (prisma) => {
        await prisma.mention.deleteMany({
          where: {
            postId: input.id,
          },
        });

        await prisma.post.update({
          where: { id: input.id },
          data: {
            hashtags: {
              disconnect: post.hashtags.map((tag) => ({ name: tag.name })),
            },
          },
        });

        if (input.mentions && input.mentions.length > 0) {
          await prisma.mention.createMany({
            data: input.mentions.map((mention) => ({
              postId: input.id,
              userId: mention.userId,
              index: mention.index,
            })),
          });
        }

        const notificationsToCreate = Array.from(newMentionUserIds)
          .filter(
            (userId) =>
              !existingMentionUserIds.has(userId) && userId !== post.authorId
          )
          .map((userId) => ({
            type: NotificationType.MENTION,
            message: `@${ctx.user.username} mentioned you in their post`,
            senderUserId: userId,
            receiverUserId: userId,
            postId: input.id,
            isPublic: true,
          }));

        if (notificationsToCreate.length > 0) {
          await prisma.notification.createMany({
            data: notificationsToCreate,
          });
        }

        const updatedPost = await prisma.post.update({
          where: { id: input.id },
          data: {
            text: filteredText,
            lastEditedAt: new Date(),
            hashtags: {
              connectOrCreate: hashtags.map((tag) => {
                const tagName = tag.slice(1);
                return {
                  where: { name: tagName },
                  create: { name: tagName },
                };
              }),
            },
          },
          select: {
            id: true,
            author: true,
          },
        });

        return { updatedPost };
      });

      if (!transactionResult) {
        throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
      }

      return {
        updatedPost: transactionResult.updatedPost,
        success: true,
        isEdited: true,
      };
    }),

  toggleHidePost: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;

      const data = { postId: input.postId, userId };

      const existingHiddenPost = await ctx.db.hiddenPost.findUnique({
        where: {
          postId_userId: data,
        },
      });

      if (existingHiddenPost == null) {
        await ctx.db.hiddenPost.create({
          data,
        });
        return { hidden: true };
      } else {
        await ctx.db.hiddenPost.delete({
          where: {
            postId_userId: data,
          },
        });
        return { hidden: false };
      }
    }),
  togglePinPost: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const postExists = await ctx.db.post.findUnique({
        where: {
          id: input.postId,
          authorId: userId,
        },
        select: {
          pinned: true,
        },
      });

      if (!postExists) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      await ctx.db.post.update({
        where: { id: input.postId },
        data: { pinned: !postExists.pinned },
      });

      return { pinned: !postExists.pinned };
    }),
});
