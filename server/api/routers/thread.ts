import { enrichThreadWithTokens, extractHashtags } from '@/lib/utils';
import {
  GET_LINK_PREVIEW,
  GET_MENTIONS,
  GET_REPOSTS,
  GET_USER,
  getAuthorAndHiddenSelect,
  getBookmarksWithBlockFilter,
  getCommentRepliesCount,
  getLikesWithBlockFilter,
} from '@/server/constants';
import { createId } from '@paralleldrive/cuid2';
import {
  EncodingStatus,
  FileType,
  NotificationType,
  PostPrivacy,
  PostStatus,
} from '@prisma/client';
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
  pinned: true,
  privacy: true,
  ...getLikesWithBlockFilter(userId),
  ...getBookmarksWithBlockFilter(userId),
  ...getAuthorAndHiddenSelect(userId!),
  ...GET_MENTIONS,
  ...GET_LINK_PREVIEW,
  reposts: {
    where: {
      user: {
        deactivated: false,
      },
    },
    ...GET_REPOSTS,
    // orderBy: {
    //   createdAt: 'desc',
    // },
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
        id: z.string(),
        text: z.string().optional(),
        media: z
          .object({
            fileType: z.nativeEnum(FileType),
            fileUrl: z.string().optional(),
            encodingStatus: z.nativeEnum(EncodingStatus).optional(),
            videoId: z.string().optional(),
            playbackId: z.string().optional(),
            aspectRatio: z.string().optional(),
            originalDimensions: z
              .object({
                width: z.number(),
                height: z.number(),
              })
              .optional(),
          })
          .nullable(),
        mentions: z
          .array(
            z.object({
              mentionedUserId: z.string(),
              index: z.number(),
            }),
          )
          .optional(),
        privacy: z.nativeEnum(PostPrivacy).default('ANYONE'),
        quoteId: z.string().optional(),
        // postAuthor: z.string().optional(),
        // parentPostId: z.string().optional(),
        linkPreview: z
          .object({
            url: z.string(),
            title: z.string().nullable().optional(),
            description: z.string().nullable().optional(),
            image: z.string().nullable().optional(),
          })
          .nullable(),
        status: z.nativeEnum(PostStatus),
      }),
    )
    .mutation(
      async ({
        ctx,
        input: {
          id,
          text,
          mentions,
          media,
          privacy,
          quoteId,
          linkPreview,
          status,
        },
      }) => {
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

          const newThread = await prisma.thread.create({
            data: {
              id,
              text: filteredText,
              authorId: userId,
              privacy,
              quoteId,
              status,
              linkPreviewUrl: linkPreviewResult?.url,
              media: media ? { create: media } : undefined,
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

  editThread: privateProcedure
    .input(
      z.object({
        id: z.string(),
        text: z.string(),
        linkPreview: z
          .object({
            url: z.string(),
            title: z.string().nullable().optional(),
            description: z.string().nullable().optional(),
            image: z.string().nullable().optional(),
          })
          .nullable(),
        mentions: z
          .array(
            z.object({
              mentionedUserId: z.string(),
              index: z.number(),
            }),
          )
          .optional(),
        privacy: z.nativeEnum(PostPrivacy).default('ANYONE'),
      }),
    )
    .mutation(
      async ({ ctx, input: { id, text, mentions, privacy, linkPreview } }) => {
        const { userId, db } = ctx;

        if (!userId) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const thread = await ctx.db.thread.findUnique({
          where: { id },
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

        if (!thread) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        if (thread.authorId !== userId) {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }

        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
        if (thread.createdAt < fifteenMinutesAgo) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Edit window has expired',
          });
        }

        const filter = new Filter();
        const textToPost = text || '';
        const filteredText = filter.clean(textToPost);
        const hashtags = extractHashtags(filteredText);

        const transactionResult = await db.$transaction(async (prisma) => {
          if (mentions && mentions.length > 0) {
            await Promise.all([
              await prisma.mention.deleteMany({
                where: {
                  threadId: id,
                },
              }),
              await prisma.mention.createMany({
                data: mentions.map((mention) => ({
                  threadId: id,
                  userId: mention.mentionedUserId,
                  index: mention.index,
                })),
              }),
            ]);
          }

          if (hashtags && hashtags.length > 0) {
            await prisma.thread.update({
              where: { id },
              data: {
                hashtags: {
                  disconnect: thread.hashtags.map((tag) => ({
                    name: tag.name,
                  })),
                },
              },
            });
          }

          let linkPreviewUrlUpdate: string | null = null;

          if (linkPreview === null) {
            linkPreviewUrlUpdate = null;
          } else if (linkPreview) {
            const savedPreview = await prisma.linkPreview.upsert({
              where: { url: linkPreview.url },
              update: {},
              create: {
                url: linkPreview.url,
                title: linkPreview.title,
                description: linkPreview.description,
                image: linkPreview.image,
              },
            });
            linkPreviewUrlUpdate = savedPreview.url;
          }

          const updatedThread = await prisma.thread.update({
            where: { id },
            data: {
              text: filteredText,
              lastEditedAt: new Date(),
              privacy,
              linkPreviewUrl: linkPreviewUrlUpdate,
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

          return { updatedThread };
        });

        if (!transactionResult) {
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        }

        return {
          updatedThread: transactionResult.updatedThread,
          success: true,
          isEdited: true,
        };
      },
    ),

  commentToThread: privateProcedure
    .input(
      z.object({
        threadAuthor: z.string(),
        id: z.string(),
        text: z.string().min(1, {
          message: 'Comment cannot be empty',
        }),
        mentions: z
          .array(
            z.object({
              mentionedUserId: z.string(),
              index: z.number(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;
      const { text, mentions, id, threadAuthor } = input;

      try {
        const transactionResult = await db.$transaction(async (prisma) => {
          const filter = new Filter();
          const filteredText = filter.clean(text);
          const hashtags = extractHashtags(filteredText);
          const threadId = createId();

          const parentThread = await prisma.thread.findUnique({
            where: { id },
            select: {
              path: true,
              id: true,
              author: {
                select: {
                  blockedUsers: {
                    select: {
                      blockedUserId: true,
                    },
                  },
                },
              },
            },
          });

          if (!parentThread) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Parent thread not found',
            });
          }

          const blockedUsers = parentThread.author.blockedUsers.map(
            (blockedUser) => blockedUser.blockedUserId,
          );

          const isBlocked = blockedUsers.includes(userId);

          if (isBlocked) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }

          const path = `/${parentThread.id}`;

          await prisma.thread.update({
            where: { id: parentThread.id },
            data: { repliesCount: { increment: 1 } },
          });

          const comment = await prisma.thread.create({
            data: {
              id: threadId,
              text: filteredText,
              authorId: userId,
              parentId: id,
              path,
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
              mentions: true,
            },
          });

          if (mentions && mentions.length > 0) {
            const mentionNotifications = comment.mentions
              .filter((user) => user.id !== userId)
              .map((user) => ({
                type: NotificationType.MENTION,
                senderUserId: userId,
                receiverUserId: user.id,
                threadId: id,
                message: `mentioned you in a comment: ${filteredText}`,
              }));

            if (mentionNotifications.length > 0) {
              await prisma.notification.createMany({
                data: mentionNotifications,
              });
            }
          }

          if (userId !== threadAuthor) {
            await prisma.notification.create({
              data: {
                type: NotificationType.COMMENT,
                senderUserId: userId,
                receiverUserId: threadAuthor,
                threadId: id,
                message: `commented: ${filteredText}`,
              },
            });
          }

          return { comment };
        });

        if (!transactionResult) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create reply',
          });
        }

        return {
          comment: transactionResult.comment,
          success: true,
        };
      } catch (error) {
        console.error('Error in replyToThread:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process mentions. Please try again.',
        });
      }
    }),

  replyToComment: privateProcedure
    .input(
      z.object({
        parentCommentId: z.string(),
        originalThreadId: z.string(),
        text: z.string().min(1, {
          message: 'Reply cannot be empty',
        }),
        mentions: z
          .array(
            z.object({
              mentionedUserId: z.string(),
              index: z.number(),
            }),
          )
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;
      const { parentCommentId, text, mentions, originalThreadId } = input;

      try {
        const transactionResult = await db.$transaction(async (prisma) => {
          const filter = new Filter();
          const filteredText = filter.clean(text);
          const hashtags = extractHashtags(filteredText);
          const replyId = createId();

          const parentComment = await prisma.thread.findUnique({
            where: { id: parentCommentId },
            select: {
              path: true,
              id: true,
              authorId: true,
              author: {
                select: {
                  blockedUsers: {
                    select: { blockedUserId: true },
                  },
                },
              },
            },
          });

          if (!parentComment) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Parent comment not found',
            });
          }

          const blockedUsers = parentComment.author.blockedUsers.map(
            (blockedUser) => blockedUser.blockedUserId,
          );

          const isBlocked = blockedUsers.includes(userId);

          if (isBlocked) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          const parentPath = parentComment.path ?? `/${parentComment.id}`;
          const path = `${parentPath}${replyId}/`;

          const ancestorIds = parentPath.split('/').filter(Boolean);

          await prisma.thread.updateMany({
            where: { id: { in: ancestorIds } },
            data: { repliesCount: { increment: 1 } },
          });

          const reply = await prisma.thread.create({
            data: {
              id: replyId,
              text: filteredText,
              authorId: userId,
              parentId: parentCommentId,
              path,
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
              mentions: true,
            },
          });

          if (mentions && mentions.length > 0) {
            const mentionNotifications = reply.mentions
              .filter((user) => user.id !== userId)
              .map((user) => ({
                type: NotificationType.MENTION,
                senderUserId: userId,
                receiverUserId: user.id,
                threadId: originalThreadId,
                message: `mentioned you in a comment: ${filteredText}`,
              }));

            if (mentionNotifications.length > 0) {
              await prisma.notification.createMany({
                data: mentionNotifications,
              });
            }
          }

          if (userId !== parentComment.authorId) {
            await prisma.notification.create({
              data: {
                type: NotificationType.COMMENT,
                senderUserId: userId,
                receiverUserId: parentComment.authorId,
                threadId: originalThreadId,
                message: `replied to your comment: ${filteredText}`,
              },
            });
          }

          return { reply };
        });

        if (!transactionResult) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create reply',
          });
        }

        return {
          reply: transactionResult.reply,
          success: true,
        };
      } catch (error) {
        console.error('Error in replyToComment:', error);
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to process reply. Please try again.',
        });
      }
    }),

  togglePinThread: privateProcedure
    .input(
      z.object({
        threadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;
      const threadExists = await db.thread.findUnique({
        where: {
          id: input.threadId,
          authorId: userId,
        },
        select: {
          pinned: true,
        },
      });

      if (!threadExists) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      await db.thread.update({
        where: { id: input.threadId },
        data: { pinned: !threadExists.pinned },
      });

      return { pinned: !threadExists.pinned };
    }),

  toggleHideThread: privateProcedure
    .input(
      z.object({
        threadId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      const data = { threadId: input.threadId, userId };

      const existingHiddenThread = await db.hiddenThread.findUnique({
        where: {
          userId_threadId: data,
        },
      });

      if (existingHiddenThread == null) {
        await db.hiddenThread.create({
          data,
        });
        return { hidden: true };
      } else {
        await db.hiddenThread.delete({
          where: {
            userId_threadId: data,
          },
        });
        return { hidden: false };
      }
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

  deleteThread: privateProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const { db } = ctx;
      try {
        await db.thread.update({
          where: {
            id: input.id,
          },
          data: {
            deleted: true,
          },
        });

        return { success: true };
      } catch (error) {
        console.error('Error in deleteThread:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete thread',
        });
      }
    }),

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
            deleted: false,
            status: PostStatus.VISIBLE,
            hiddenBy: { none: { userId } },
            text: searchQuery ? { contains: searchQuery } : undefined,
            createdAt: cursor ? { lt: cursor.createdAt } : undefined,
            author: {
              deactivated: false,
              mutedByUsers: { none: { mutedByUserId: userId } },
              blockedByUsers: { none: { blockingUserId: userId } },
              blockedUsers: { none: { blockedUserId: userId } },
            },
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

      const formattedThreads = await Promise.all(
        pagedFeed.map(async (item) => {
          const threadWithTokens = await enrichThreadWithTokens(item);
          return {
            ...threadWithTokens,
            likesCount: item.likes.length,
            repostsCount: item.reposts.length,
            repliesCount: item.repliesCount,
            bookmarksCount: new Set(item.bookmarks.map((b) => b.userId)).size,
          };
        }),
      );

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

  getThreadById: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const { userId, db } = ctx;

      const thread = await db.thread.findUnique({
        where: { id },
        select: THREAD_SELECT(userId!),
      });

      if (!thread) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const threadWithTokens = await enrichThreadWithTokens(thread);
      return {
        ...threadWithTokens,
        likesCount: thread.likes.length,
        repostsCount: thread.reposts.length,
        repliesCount: thread.repliesCount,
        bookmarksCount: new Set(thread.bookmarks.map((b) => b.userId)).size,
      };
    }),

  getFollowingThreads: privateProcedure
    .input(paginationInput)
    .query(async ({ input, ctx }) => {
      const { limit, cursor, searchQuery } = input;
      const { userId, db } = ctx;

      const threads = await db.thread.findMany({
        where: {
          author: {
            deactivated: false,
            mutedByUsers: { none: { mutedByUserId: userId } },
            followers: { some: { followerId: userId } },
            blockedByUsers: { none: { blockingUserId: userId } },
            blockedUsers: { none: { blockedUserId: userId } },
          },
          parentId: null,
          deleted: false,
          status: PostStatus.VISIBLE,
          hiddenBy: { none: { userId } },
          text: searchQuery ? { contains: searchQuery } : undefined,
          createdAt: cursor ? { lt: cursor.createdAt } : undefined,
        },
        take: limit + 1,
        orderBy: { createdAt: 'desc' },
        select: THREAD_SELECT(userId),
      });

      const formattedThreads = threads.map((item) => ({
        ...item,
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
          hiddenBy: { none: { userId } },
          text: searchQuery ? { contains: searchQuery } : undefined,
          deleted: false,
          status: PostStatus.VISIBLE,
          author: {
            deactivated: false,
            mutedByUsers: { none: { mutedByUserId: userId } },
            blockedByUsers: { none: { blockingUserId: userId } },
            blockedUsers: { none: { blockedUserId: userId } },
          },
        },
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: THREAD_SELECT(userId),
      });

      const formattedThreads = threads.map((t) => ({
        ...t,
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
          deleted: false,
          status: PostStatus.VISIBLE,
          parentId: null,
          hiddenBy: { none: { userId } },
          author: {
            deactivated: false,
            mutedByUsers: { none: { mutedByUserId: userId } },
            blockedByUsers: { none: { blockingUserId: userId } },
            blockedUsers: { none: { blockedUserId: userId } },
          },
        },
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: THREAD_SELECT(userId),
      });

      const formattedThreads = threads.map((t) => ({
        ...t,
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
          media: threadInfo.media,
          linkPreview: threadInfo.linkPreview,
          mentions: threadInfo.mentions,
        },
      };
    }),

  getComments: privateProcedure
    .input(
      z.object({
        id: z.string(),
        limit: z.number().optional().default(10),
        sortBy: z.enum(['LATEST', 'OLDEST']),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { id, limit, cursor, sortBy } = input;
      const { userId, db } = ctx;

      const comments = await db.thread.findMany({
        where: {
          deleted: false,
          parentId: id,
          author: {
            deactivated: false,
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
        take: limit + 1,
        skip: 0,
        cursor: cursor ? { id: cursor.id } : undefined,
        select: { ...THREAD_SELECT(userId), ...getCommentRepliesCount(userId) },
        orderBy:
          sortBy === 'LATEST' ? { createdAt: 'desc' } : { createdAt: 'asc' },
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
        likesCount: comment.likes.length,
        repostsCount: comment.reposts.length,
        repliesCount: comment._count.replies,
        bookmarksCount: new Set(
          comment.bookmarks.map((bookmark) => bookmark.userId),
        ).size,
        isHidden: comment.hiddenBy.length > 0,
        isMuted: comment.author.mutedByUsers?.length > 0,
      }));

      return {
        comments: formattedComments,
        nextCursor,
      };
    }),

  getReplies: privateProcedure
    .input(
      z.object({
        parentCommentId: z.string(),
        limit: z.number().optional().default(8),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      }),
    )
    .query(async ({ input, ctx }) => {
      const { parentCommentId, limit, cursor } = input;
      const { userId, db } = ctx;

      const replies = await db.thread.findMany({
        where: {
          deleted: false,
          parentId: parentCommentId,
          author: {
            deactivated: false,
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
        take: limit + 1,
        skip: 0,
        cursor: cursor ? { id: cursor.id } : undefined,
        select: THREAD_SELECT(userId),
        orderBy: { createdAt: 'asc' },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (replies.length > limit) {
        const nextItem = replies[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        replies.pop();
      }

      const formattedReplies = replies.map((reply) => ({
        ...reply,
        likesCount: reply.likes.length,
        repostsCount: reply.reposts.length,
        bookmarksCount: new Set(
          reply.bookmarks.map((bookmark) => bookmark.userId),
        ).size,
        isHidden: reply.hiddenBy.length > 0,
        isMuted: reply.author.mutedByUsers?.length > 0,
      }));

      return {
        replies: formattedReplies,
        nextCursor,
      };
    }),
});
