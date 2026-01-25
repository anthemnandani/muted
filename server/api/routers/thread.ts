import { PostMedia } from '@/lib/types';
import { extractHashtags } from '@/lib/utils';
import {
  GET_LINK_PREVIEW,
  GET_MENTIONS,
  GET_USER,
  getBookmarksWithBlockFilter,
  getLikesWithBlockFilter,
} from '@/server/constants';
import { createId } from '@paralleldrive/cuid2';
import { PostPrivacy } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { Filter } from 'bad-words';
import z from 'zod';
import { createTRPCRouter, privateProcedure } from '../trpc';

const THREAD_SELECT = (userId: string) => ({
  id: true,
  createdAt: true,
  text: true,
  media: true,
  parentId: true,
  quoteId: true,
  path: true,
  repliesCount: true,
  hideLikes: true,
  privacy: true,
  author: { select: { ...GET_USER } },
  ...getLikesWithBlockFilter(userId),
  ...getBookmarksWithBlockFilter(userId),
  ...GET_MENTIONS,
  ...GET_LINK_PREVIEW,
  reposts: {
    select: {
      createdAt: true,
      threadId: true,
      user: { select: { ...GET_USER } },
    },
  },
});

const paginationInput = z.object({
  limit: z.number().optional().default(20),
  cursor: z
    .object({
      id: z.string(),
      createdAt: z.date(),
    })
    .optional(),
  searchQuery: z.string().optional(),
});

export const threadRouter = createTRPCRouter({
  createThread: privateProcedure
    .input(
      z.object({
        text: z.string().optional(),
        // media: z
        //   .object({
        //     fileType: z.string(),
        //     fileUrl: z.string(),
        //     aspectRatio: z.string().optional(),
        //     originalDimensions: z
        //       .object({
        //         width: z.number(),
        //         height: z.number(),
        //       })
        //       .optional(),
        //   })
        //   .optional(),
        mentions: z
          .array(
            z.object({
              mentionedUserId: z.string(),
              index: z.number(),
            }),
          )
          .optional(),
        privacy: z.nativeEnum(PostPrivacy).default('ANYONE'),
        // quoteId: z.string().optional(),
        // postAuthor: z.string().optional(),
        // parentPostId: z.string().optional(),
        linkPreview: z
          .object({
            url: z.string(),
            title: z.string().nullable().optional(),
            description: z.string().nullable().optional(),
            image: z.string().nullable().optional(),
          })
          .optional(),
      }),
    )
    .mutation(
      async ({ ctx, input: { text, mentions, privacy, linkPreview } }) => {
        const { userId, db } = ctx;

        if (!userId) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const filter = new Filter();
        const textToPost = text || '';
        const filteredText = filter.clean(textToPost);
        const hashtags = extractHashtags(filteredText);

        const transactionResult = await db.$transaction(async (prisma) => {
          let linkPreviewResult;

          if (linkPreview) {
            linkPreviewResult = await prisma.linkPreview.upsert({
              where: { url: linkPreview.url },
              update: {},
              create: {
                url: linkPreview.url,
                title: linkPreview.title,
                description: linkPreview.description,
                image: linkPreview.image,
              },
            });
          }

          const threadId = createId();
          const path = `/${threadId}/`;

          const newThread = await prisma.thread.create({
            data: {
              id: threadId,
              text: filteredText,
              authorId: userId,
              // media: input.media,
              privacy,
              // quoteId: input.quoteId,
              path,
              linkPreviewUrl: linkPreviewResult?.url,
              hashtags: {
                connectOrCreate: hashtags.map((tag) => {
                  const tagName = tag.slice(1);
                  return {
                    where: { name: tagName },
                    create: { name: tagName },
                  };
                }),
              },
              mentions: mentions
                ? {
                    create: mentions.map((mention) => ({
                      index: mention.index,
                      user: {
                        connect: {
                          id: mention.mentionedUserId,
                        },
                      },
                    })),
                  }
                : undefined,
            },
            select: {
              id: true,
              author: true,
            },
          });

          // if (input.postAuthor && userId !== input.postAuthor) {
          //   await prisma.notification.create({
          //     data: {
          //       type: 'QUOTE',
          //       senderUserId: userId,
          //       receiverUserId: input.postAuthor,
          //       postId: newpost.id,
          //       message: filteredText,
          //     },
          //   });
          // }

          // if (input.mentions?.length) {
          //   await Promise.all(
          //     input.mentions.map((mention) =>
          //       prisma.notification.create({
          //         data: {
          //           type: 'MENTION',
          //           senderUserId: userId,
          //           receiverUserId: mention.userId,
          //           postId: newpost.id,
          //           message: filteredText,
          //         },
          //       }),
          //     ),
          //   );
          // }

          return {
            newThread,
          };
        });

        if (!transactionResult) {
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        }

        return {
          thread: transactionResult.newThread,
          success: true,
        };
      },
    ),

  getAllThreads: privateProcedure
    .input(paginationInput)
    .query(async ({ input, ctx }) => {
      const { userId, db } = ctx;
      const { limit, cursor, searchQuery } = input;

      const [threads, reposts] = await Promise.all([
        db.thread.findMany({
          where: {
            parentId: null,
            privacy: 'ANYONE',
            text: searchQuery ? { contains: searchQuery } : undefined,
            createdAt: cursor ? { lt: cursor.createdAt } : undefined,
          },
          take: limit + 1,
          orderBy: { createdAt: 'desc' },
          select: THREAD_SELECT(userId),
        }),
        db.repost.findMany({
          where: {
            createdAt: cursor ? { lt: cursor.createdAt } : undefined,
          },
          take: limit + 1,
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { ...GET_USER } },
            thread: { select: THREAD_SELECT(userId) },
          },
        }),
      ]);

      const normalizedThreads = threads.map((t) => ({
        ...t,
        type: 'thread',
        sortDate: t.createdAt,
        repostedBy: null,
        repostedAt: null,
      }));

      const normalizedReposts = reposts
        .filter((r) => r.thread !== null)
        .map((r) => ({
          ...r.thread!,
          type: 'repost',
          sortDate: r.createdAt,
          repostedBy: r.user,
          repostedAt: r.createdAt,
        }));

      const combinedFeed = [...normalizedThreads, ...normalizedReposts].sort(
        (a, b) => b.sortDate.getTime() - a.sortDate.getTime(),
      );

      const pagedFeed = combinedFeed.slice(0, limit + 1);

      const formattedThreads = pagedFeed.map((item) => ({
        ...item,
        media: item.media as PostMedia[],
        likesCount: item.likes.length,
        repostsCount: item.reposts.length,
        repliesCount: item.repliesCount,
        bookmarksCount: new Set(item.bookmarks.map((b) => b.userId)).size,
      }));

      let nextCursor;
      if (formattedThreads.length > limit) {
        const nextItem = formattedThreads[limit];
        formattedThreads.pop();
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
      }

      return { threads: formattedThreads, nextCursor };
    }),

  getFollowingThreads: privateProcedure
    .input(paginationInput)
    .query(async ({ input, ctx }) => {
      const { limit, cursor, searchQuery } = input;
      const { userId, db } = ctx;

      const threads = await db.thread.findMany({
        where: {
          author: { followers: { some: { followerId: userId } } },
          parentId: null,
          text: searchQuery ? { contains: searchQuery } : undefined,
          createdAt: cursor ? { lt: cursor.createdAt } : undefined,
        },
        take: limit + 1,
        orderBy: { createdAt: 'desc' },
        select: THREAD_SELECT(userId),
      });

      const formattedThreads = threads.map((item) => ({
        ...item,
        media: item.media as PostMedia[],
        likesCount: item.likes.length,
        repostsCount: item.reposts.length,
        repliesCount: item.repliesCount,
        bookmarksCount: new Set(item.bookmarks.map((b) => b.userId)).size,
      }));

      let nextCursor;
      if (formattedThreads.length > limit) {
        const nextItem = formattedThreads[limit];
        formattedThreads.pop();
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
      }

      return { threads: formattedThreads, nextCursor };
    }),

  getLikedThreads: privateProcedure
    .input(paginationInput)
    .query(async ({ input, ctx }) => {
      const { limit, cursor, searchQuery } = input;
      const { userId, db } = ctx;

      const threads = await db.thread.findMany({
        where: {
          likes: { some: { userId } },
          text: searchQuery ? { contains: searchQuery } : undefined,
        },
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: THREAD_SELECT(userId),
      });

      const formattedThreads = threads.map((t) => ({
        ...t,
        media: t.media as PostMedia[],
        likesCount: t.likes.length,
        repostsCount: t.reposts.length,
        repliesCount: t.repliesCount,
        bookmarksCount: new Set(t.bookmarks.map((b) => b.userId)).size,
        repostedBy: null,
        repostedAt: null,
      }));

      let nextCursor;
      if (formattedThreads.length > limit) {
        const nextItem = formattedThreads[limit];
        formattedThreads.pop();
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
      }

      return { threads: formattedThreads, nextCursor };
    }),

  getSavedThreads: privateProcedure
    .input(paginationInput)
    .query(async ({ input, ctx }) => {
      const { limit, cursor, searchQuery } = input;
      const { userId, db } = ctx;

      const threads = await db.thread.findMany({
        where: {
          bookmarks: { some: { userId } },
          text: searchQuery ? { contains: searchQuery } : undefined,
        },
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: THREAD_SELECT(userId),
      });

      const formattedThreads = threads.map((t) => ({
        ...t,
        media: t.media as PostMedia[],
        likesCount: t.likes.length,
        repostsCount: t.reposts.length,
        repliesCount: t.repliesCount,
        bookmarksCount: new Set(t.bookmarks.map((b) => b.userId)).size,
        repostedBy: null,
        repostedAt: null,
      }));

      let nextCursor;
      if (formattedThreads.length > limit) {
        const nextItem = formattedThreads[limit];
        formattedThreads.pop();
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
      }

      return { threads: formattedThreads, nextCursor };
    }),

  getQuotedThread: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { userId } = ctx;
      const threadInfo = await ctx.db.thread.findUnique({
        where: {
          id: input.id,
        },
        select: THREAD_SELECT(userId),
      });

      if (!threadInfo) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return {
        threadInfo: {
          id: threadInfo.id,
          text: threadInfo.text,
          createdAt: threadInfo.createdAt,
          likeCount: threadInfo.likes,
          user: threadInfo.author,
          likes: threadInfo.likes.length,
          repliesCount: threadInfo.repliesCount,
          media: threadInfo.media as PostMedia[],
          linkPreview: threadInfo.linkPreview,
          mentions: threadInfo.mentions,
        },
      };
    }),

  toggleRepost: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input: { id }, ctx }) => {
      const { userId, db } = ctx;
      const data = { threadId: id, userId };

      const existingRepost = await db.repost.findUnique({
        where: {
          userId_threadId: data,
        },
      });

      if (existingRepost == null) {
        const transactionResult = await db.$transaction(async (prisma) => {
          const createdRepost = await prisma.repost.create({
            data,
            select: {
              thread: {
                select: {
                  text: true,
                  authorId: true,
                },
              },
            },
          });

          // const createNotification = await prisma.notification.create({
          //   data: {
          //     type: 'REPOST',
          //     postId: data.postId,
          //     message: createdRepost.post.text || '',
          //     senderUserId: userId,
          //     receiverUserId: createdRepost.post.authorId,
          //   },
          // });

          return {
            createdRepost,
            // createNotification,
          };
        });

        if (!transactionResult) {
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        }

        return { createdRepost: true };
      } else {
        const transactionResult = await db.$transaction(async (prisma) => {
          const removeRepost = await prisma.repost.delete({
            where: {
              userId_threadId: data,
            },
          });

          // const notification = await prisma.notification.findFirst({
          //   where: {
          //     senderUserId: userId,
          //     postId: data.postId,
          //     type: 'REPOST',
          //   },
          //   select: {
          //     id: true,
          //   },
          // });

          // if (notification) {
          //   await prisma.notification.delete({
          //     where: {
          //       id: notification.id,
          //     },
          //   });
          // }

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
});
