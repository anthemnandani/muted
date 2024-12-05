import { PostMedia } from '@/lib/types';
import { extractHashtags, getUserEmail } from '@/lib/utils';
import {
  GET_BOOKMARKS,
  GET_COUNT,
  GET_LIKES,
  GET_LINK_PREVIEW,
  GET_MENTIONS,
  GET_REPOSTS,
  GET_USER,
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
          .object({
            fileType: z.string(),
            fileUrl: z.string(),
            aspectRatio: z.string().optional(),
            originalDimensions: z
              .object({
                width: z.number(),
                height: z.number(),
              })
              .optional(),
          })
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

  getInfinitePosts: publicProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 20, cursor, searchQuery }, ctx }) => {
      const posts = await ctx.db.post.findMany({
        where: {
          text: {
            contains: searchQuery,
          },
          OR: [
            { parentPostId: null },
            {
              AND: [{ parentPostId: { not: null } }, { reposts: { some: {} } }],
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
          repliesCount: true,
          hideLikes: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...GET_LIKES,
          ...GET_BOOKMARKS,
          ...GET_COUNT,
          ...GET_REPOSTS,
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
          reposts: {
            select: {
              createdAt: true,
              user: {
                select: {
                  ...GET_USER,
                },
              },
              post: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      const repostsMap = new Map();
      const flattenedPosts = posts.flatMap((post) => {
        if (post.parentPostId === null) {
          const postItem = {
            ...post,
            media: post.media as PostMedia,
            reposts: post.reposts.map((repost) => ({
              userId: repost.user.id,
              postId: repost.post.id,
            })),
            likesCount: post._count.likes,
            repostsCount: post._count.reposts,
            bookmarksCount: post._count.bookmarks,
            type: 'post' as const,
          };

          const repostItems = post.reposts.map((repost) => ({
            ...post,
            media: post.media as PostMedia,
            reposts: post.reposts.map((repost) => ({
              userId: repost.user.id,
              postId: repost.post.id,
            })),
            likesCount: post._count.likes,
            repostsCount: post._count.reposts,
            bookmarksCount: post._count.bookmarks,
            repostedBy: repost.user,
            repostedAt: repost.createdAt,
            type: 'repost' as const,
          }));

          repostItems.forEach((item) =>
            repostsMap.set(`${item.repostedBy.id}-${post.id}`, item)
          );

          return [postItem, ...repostItems];
        } else {
          return post.reposts.map((repost) => {
            const repostItem = {
              ...post,
              media: post.media as PostMedia,
              reposts: post.reposts.map((repost) => ({
                userId: repost.user.id,
                postId: repost.post.id,
              })),
              likesCount: post._count.likes,
              repostsCount: post._count.reposts,
              bookmarksCount: post._count.bookmarks,
              repostedBy: repost.user,
              repostedAt: repost.createdAt,
              type: 'repost' as const,
            };
            repostsMap.set(`${repost.user.id}-${post.id}`, repostItem);
            return repostItem;
          });
        }
      });

      const uniqueFlattenedPosts = flattenedPosts.filter((item) => {
        if (item.type === 'repost') {
          const key = `${item.repostedBy.id}-${item.id}`;
          return repostsMap.get(key) === item;
        }
        return true;
      });

      uniqueFlattenedPosts.sort((a, b) => {
        const aTime =
          a.type === 'repost' ? a.repostedAt.getTime() : a.createdAt.getTime();
        const bTime =
          b.type === 'repost' ? b.repostedAt.getTime() : b.createdAt.getTime();
        return bTime - aTime;
      });

      let nextCursor: typeof cursor | undefined;

      if (uniqueFlattenedPosts.length > limit) {
        const nextItem = uniqueFlattenedPosts[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        uniqueFlattenedPosts.length = limit;
      }

      return {
        posts: uniqueFlattenedPosts,
        nextCursor,
      };
    }),

  replyToPost: privateProcedure
    .input(
      z.object({
        postAuthor: z.string(),
        postId: z.string(),
        text: z.string().min(3, {
          message: 'Text must be at least 3 characters',
        }),
        media: z
          .object({
            fileType: z.string(),
            fileUrl: z.string(),
          })
          .optional(),
        privacy: z.nativeEnum(PostPrivacy),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user, userId } = ctx;
      const email = getUserEmail(user);
      const dbUser = await ctx.db.user.findUnique({
        where: { email },
        select: { verified: true },
      });

      if (!dbUser) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const filter = new Filter();
      const filteredText = filter.clean(input.text);

      const transactionResult = await ctx.db.$transaction(async (prisma) => {
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
            media: input.media,
            privacy: input.privacy,
            authorId: userId,
            parentPostId: input.postId,
            path,
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

  getNestedPosts: publicProcedure
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
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...GET_LIKES,
          ...GET_BOOKMARKS,
          ...GET_REPOSTS,
          ...GET_COUNT,
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
        },
      });

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }

      const replies = await ctx.db.post.findMany({
        where: {
          path: {
            startsWith: `${post.path}`,
          },
          id: {
            not: post.id,
          },
        },
        take: limit + 1,
        cursor: cursor ? { id: cursor.id } : undefined,
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
          repliesCount: true,
          hideLikes: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...GET_LIKES,
          ...GET_REPOSTS,
          ...GET_COUNT,
          ...GET_BOOKMARKS,
          ...GET_LINK_PREVIEW,
        },
        orderBy: [{ path: 'asc' }, { createdAt: 'asc' }],
      });

      const formatReply = (reply: (typeof replies)[number]) => ({
        ...reply,
        media: reply.media as PostMedia,
        likesCount: reply._count.likes,
        repostsCount: reply._count.reposts,
        bookmarksCount: reply._count.bookmarks,
        postChildren: [],
      });

      const replyMap = new Map();
      const topLevelReplies: any = [];

      replies.forEach((reply) => {
        const formattedReply = formatReply(reply);
        replyMap.set(reply.id, formattedReply);

        if (reply.parentPostId === post.id) {
          topLevelReplies.push(formattedReply);
        } else {
          const parentReply = replyMap.get(reply.parentPostId);
          if (parentReply) {
            parentReply.postChildren.push(formattedReply);
          } else {
            topLevelReplies.push(formattedReply);
          }
        }
      });

      let nextCursor: typeof cursor | undefined;
      if (topLevelReplies.length > limit) {
        const nextItem = topLevelReplies[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        topLevelReplies.length = limit;
      }

      return {
        postInfo: {
          ...post,
          media: post.media as PostMedia,
          likesCount: post._count.likes,
          repostsCount: post._count.reposts,
          bookmarksCount: post._count.bookmarks,
        },
        replies: topLevelReplies,
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
  toggleBookmark: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input: { id }, ctx }) => {
      const { userId } = ctx;

      const data = { postId: id, userId };

      const existingBookmark = await ctx.db.bookmark.findUnique({
        where: {
          postId_userId: data,
        },
      });

      if (existingBookmark == null) {
        const transactionResult = await ctx.db.$transaction(async (prisma) => {
          const createdBookmark = await prisma.bookmark.create({
            data,
            select: {
              post: {
                select: {
                  text: true,
                  author: true,
                },
              },
            },
          });

          const createdNotification = await prisma.notification.create({
            data: {
              type: 'BOOKMARK',
              senderUserId: userId,
              receiverUserId: createdBookmark.post.author.id,
              postId: data.postId,
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
              postId_userId: data,
            },
          });

          const notification = await prisma.notification.findFirst({
            where: {
              senderUserId: userId,
              postId: data.postId,
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
          media: postInfo.media as PostMedia,
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
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      const { userId } = ctx;
      const savedPosts = await ctx.db.bookmark.findMany({
        where: {
          userId,
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
              repliesCount: true,
              hideLikes: true,
              author: {
                select: {
                  ...GET_USER,
                },
              },
              ...GET_LIKES,
              ...GET_REPOSTS,
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
      if (savedPosts.length > limit) {
        const nextItem = savedPosts[limit];
        nextCursor = {
          postId: nextItem.post.id,
          userId,
        };
        savedPosts.length = limit;
      }

      return {
        posts: savedPosts.map((savedPost) => ({
          ...savedPost.post,
          media: savedPost.post.media as PostMedia,
          likesCount: savedPost.post._count.likes,
          repostsCount: savedPost.post._count.reposts,
          bookmarksCount: savedPost.post._count.bookmarks,
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
              repliesCount: true,
              hideLikes: true,
              author: {
                select: {
                  ...GET_USER,
                },
              },
              ...GET_LIKES,
              ...GET_REPOSTS,
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
          media: likedPost.post.media as PostMedia,
          likesCount: likedPost.post._count.likes,
          repostsCount: likedPost.post._count.reposts,
          bookmarksCount: likedPost.post._count.bookmarks,
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
          author: {
            followers: {
              some: {
                id: userId,
              },
            },
          },
          parentPostId: null,
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
          repliesCount: true,
          hideLikes: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...GET_LIKES,
          ...GET_REPOSTS,
          ...GET_COUNT,
          ...GET_BOOKMARKS,
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

      return {
        posts: followingPosts.map((post) => ({
          ...post,
          media: post.media as PostMedia,
          likesCount: post._count.likes,
          repostsCount: post._count.reposts,
          bookmarksCount: post._count.bookmarks,
        })),
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
          repliesCount: true,
          hideLikes: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...GET_LIKES,
          ...GET_BOOKMARKS,
          ...GET_COUNT,
          ...GET_REPOSTS,
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
          reposts: {
            select: {
              createdAt: true,
              user: {
                select: {
                  ...GET_USER,
                },
              },
              post: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      const repostsMap = new Map();
      const flattenedPosts = posts.flatMap((post) => {
        if (post.parentPostId === null) {
          const postItem = {
            ...post,
            media: post.media as PostMedia,
            reposts: post.reposts.map((repost) => ({
              userId: repost.user.id,
              postId: repost.post.id,
            })),
            likesCount: post._count.likes,
            repostsCount: post._count.reposts,
            bookmarksCount: post._count.bookmarks,
            type: 'post' as const,
          };

          const repostItems = post.reposts.map((repost) => ({
            ...post,
            media: post.media as PostMedia,
            reposts: post.reposts.map((repost) => ({
              userId: repost.user.id,
              postId: repost.post.id,
            })),
            likesCount: post._count.likes,
            repostsCount: post._count.reposts,
            bookmarksCount: post._count.bookmarks,
            repostedBy: repost.user,
            repostedAt: repost.createdAt,
            type: 'repost' as const,
          }));

          repostItems.forEach((item) =>
            repostsMap.set(`${item.repostedBy.id}-${post.id}`, item)
          );

          return [postItem, ...repostItems];
        } else {
          return post.reposts.map((repost) => {
            const repostItem = {
              ...post,
              media: post.media as PostMedia,
              reposts: post.reposts.map((repost) => ({
                userId: repost.user.id,
                postId: repost.post.id,
              })),
              likesCount: post._count.likes,
              repostsCount: post._count.reposts,
              bookmarksCount: post._count.bookmarks,
              repostedBy: repost.user,
              repostedAt: repost.createdAt,
              type: 'repost' as const,
            };
            repostsMap.set(`${repost.user.id}-${post.id}`, repostItem);
            return repostItem;
          });
        }
      });

      const uniqueFlattenedPosts = flattenedPosts.filter((item) => {
        if (item.type === 'repost') {
          const key = `${item.repostedBy.id}-${item.id}`;
          return repostsMap.get(key) === item;
        }
        return true;
      });

      uniqueFlattenedPosts.sort((a, b) => {
        const aTime =
          a.type === 'repost' ? a.repostedAt.getTime() : a.createdAt.getTime();
        const bTime =
          b.type === 'repost' ? b.repostedAt.getTime() : b.createdAt.getTime();
        return bTime - aTime;
      });

      let nextCursor: typeof cursor | undefined;

      if (uniqueFlattenedPosts.length > limit) {
        const nextItem = uniqueFlattenedPosts[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        uniqueFlattenedPosts.length = limit;
      }

      return {
        posts: uniqueFlattenedPosts,
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
});
