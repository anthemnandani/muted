import { ParentPostProps } from '@/lib/types';
import { getUserEmail } from '@/lib/utils';
import {
  GET_BOOKMARKS,
  GET_COUNT,
  GET_LIKES,
  GET_REPOSTS,
  GET_USER,
} from '@/server/constants';
import { createId } from '@paralleldrive/cuid2';
import { PostPrivacy } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { Filter } from 'bad-words';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '../trpc';

export const postRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        text: z.string().min(3, {
          message: 'Text must be at least 3 character',
        }),
        imageUrl: z.string().optional(),
        privacy: z.nativeEnum(PostPrivacy).default('ANYONE'),
        quoteId: z.string().optional(),
        postAuthor: z.string().optional(),
        parentPostId: z.string().optional(),
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
      const filteredText = filter.clean(input.text);

      const transactionResult = await ctx.db.$transaction(async (prisma) => {
        const postId = createId();
        const path = `/${postId}/`;
        const newpost = await ctx.db.post.create({
          data: {
            id: postId,
            text: filteredText,
            authorId: userId,
            images: input.imageUrl ? [input.imageUrl] : [],
            privacy: input.privacy,
            quoteId: input.quoteId,
            path,
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
              message: input.text,
            },
          });
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
          images: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          repliesCount: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...GET_LIKES,
          ...GET_BOOKMARKS,
          ...GET_COUNT,
          ...GET_REPOSTS,
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
        imageUrl: z.string().optional(),
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
            images: input.imageUrl ? [input.imageUrl] : [],
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
          images: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          repliesCount: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...GET_LIKES,
          ...GET_BOOKMARKS,
          ...GET_REPOSTS,
          ...GET_COUNT,
        },
      });

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }

      const ancestorIds = post.path
        ? post.path.split('/').filter(Boolean).slice(0, -1)
        : [];

      let parentPosts: ParentPostProps[] = [];
      if (ancestorIds.length > 0) {
        parentPosts = await ctx.db.post.findMany({
          where: { id: { in: ancestorIds } },
          select: {
            id: true,
            createdAt: true,
            text: true,
            images: true,
            parentPostId: true,
            quoteId: true,
            path: true,
            repliesCount: true,
            author: {
              select: {
                ...GET_USER,
              },
            },
            ...GET_LIKES,
            ...GET_BOOKMARKS,
            ...GET_REPOSTS,
            ...GET_COUNT,
          },
        });

        const idOrderMap = new Map();
        ancestorIds.forEach((id, index) => idOrderMap.set(id, index));
        parentPosts.sort((a, b) => idOrderMap.get(a.id) - idOrderMap.get(b.id));
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
          images: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          repliesCount: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...GET_LIKES,
          ...GET_REPOSTS,
          ...GET_COUNT,
          ...GET_BOOKMARKS,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      let nextCursor: typeof cursor | undefined;

      if (replies.length > limit) {
        const nextItem = replies.pop();
        if (nextItem != null) {
          nextCursor = {
            id: nextItem.id,
            createdAt: nextItem.createdAt,
          };
        }
      }

      return {
        postInfo: {
          ...post,
          likesCount: post._count.likes,
          repostsCount: post._count.reposts,
          bookmarksCount: post._count.bookmarks,
        },
        parentPosts: parentPosts.map((parentPost) => ({
          ...parentPost,
          likesCount: parentPost?._count?.likes,
          repostsCount: parentPost?._count?.reposts,
          bookmarksCount: parentPost?._count?.bookmarks,
        })),
        replies: replies.map((reply) => ({
          ...reply,
          likesCount: reply._count.likes,
          repostsCount: reply._count.reposts,
          bookmarksCount: reply._count.bookmarks,
        })),
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
              message: createdRepost.post.text,
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
              message: createdBookmark.post.text,
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
          ...GET_LIKES,
          images: true,
          path: true,
          repliesCount: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...GET_COUNT,
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
        },
      };
    }),
});
