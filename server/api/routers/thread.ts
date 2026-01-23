import { PostMedia, ThreadFilter } from '@/lib/types';
import { extractHashtags } from '@/lib/utils';
import {
  GET_MENTIONS,
  GET_USER,
  getBookmarksWithBlockFilter,
  getLikesWithBlockFilter,
} from '@/server/constants';
import { createId } from '@paralleldrive/cuid2';
import { PostPrivacy, Prisma } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { Filter } from 'bad-words';
import z from 'zod';
import { createTRPCRouter, privateProcedure } from '../trpc';

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
        // linkPreview: z
        //   .object({
        //     url: z.string(),
        //     title: z.string().nullable().optional(),
        //     description: z.string().nullable().optional(),
        //     image: z.string().nullable().optional(),
        //   })
        //   .optional(),
      }),
    )
    .mutation(async ({ ctx, input: { text, mentions, privacy } }) => {
      const { userId, db } = ctx;

      if (!userId) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const filter = new Filter();
      const textToPost = text || '';
      const filteredText = filter.clean(textToPost);
      const hashtags = extractHashtags(filteredText);

      const transactionResult = await db.$transaction(async (prisma) => {
        // let linkPreview;

        // if (input.linkPreview) {
        //   linkPreview = await prisma.linkPreview.upsert({
        //     where: { url: input.linkPreview.url },
        //     update: {},
        //     create: {
        //       url: input.linkPreview.url,
        //       title: input.linkPreview.title,
        //       description: input.linkPreview.description,
        //       image: input.linkPreview.image,
        //     },
        //   });
        // }

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
            // linkPreviewUrl: linkPreview?.url,
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
    }),

  getInfiniteThreads: privateProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
        filter: z
          .nativeEnum(ThreadFilter)
          .optional()
          .default(ThreadFilter.FOR_YOU),
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      }),
    )
    .query(
      async ({ input: { limit = 20, filter, cursor, searchQuery }, ctx }) => {
        const { userId, db } = ctx;
        let whereClause: Prisma.ThreadWhereInput = {
          text: {
            contains: searchQuery,
          },
        };

        // Switch logic based on filter
        switch (filter) {
          case ThreadFilter.FOLLOWING:
            whereClause = {
              ...whereClause,
              author: {
                followers: {
                  some: {
                    followerId: userId,
                  },
                },
              },
              OR: [{ parentId: null }, { reposts: { some: {} } }],
            };
            break;

          case ThreadFilter.LIKED:
            whereClause = {
              ...whereClause,
              likes: {
                some: {
                  userId,
                },
              },
            };
            break;

          case ThreadFilter.SAVED:
            whereClause = {
              ...whereClause,
              bookmarks: {
                some: {
                  userId,
                },
              },
            };
            break;

          case ThreadFilter.FOR_YOU:
          default:
            whereClause = {
              ...whereClause,
              OR: [
                { parentId: null },
                {
                  AND: [{ parentId: { not: null } }, { reposts: { some: {} } }],
                },
              ],
            };
            break;
        }
        const threads = await db.thread.findMany({
          where: whereClause,
          take: limit + 1,
          cursor: cursor ? { createdAt_id: cursor } : undefined,
          orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
          select: {
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
            author: {
              select: {
                ...GET_USER,
              },
            },
            ...getLikesWithBlockFilter(userId),
            ...getBookmarksWithBlockFilter(userId),
            ...GET_MENTIONS,
            //   ...getPostReplies(userId),
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

        const formattedThreads = await Promise.all(
          threads.map(async (thread) => {
            return {
              ...thread,
              media: thread.media as PostMedia[],
              likesCount: thread.likes.length,
              repostsCount: thread.reposts.length,
              repliesCount: thread.repliesCount,
              bookmarksCount: new Set(
                thread.bookmarks.map((bookmark) => bookmark.userId),
              ).size,
            };
          }),
        );

        let nextCursor: typeof cursor | undefined;
        if (formattedThreads.length > limit) {
          const nextItem = formattedThreads[limit];
          nextCursor = {
            id: nextItem.id,
            createdAt: nextItem.createdAt,
          };
          formattedThreads.length = limit;
        }

        return {
          threads: formattedThreads,
          nextCursor,
        };
      },
    ),
});
