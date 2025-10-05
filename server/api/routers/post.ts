import { DownloadableData, type PostMedia } from '@/lib/types';
import {
  capitalizeFirstLetter,
  extractHashtags,
  formatDateAndTime,
  formatUTCDate,
  getTotalRepliesCount,
  getUserEmail,
} from '@/lib/utils';
import {
  GET_LINK_PREVIEW,
  GET_MENTIONS,
  GET_REPOSTS,
  GET_USER,
  getAuthorAndHiddenSelect,
  getBookmarksWithBlockFilter,
  getCommentRepliesCount,
  getLikesWithBlockFilter,
  getPostRepliesCount,
  getPrivacyFilter,
} from '@/server/constants';
import { createId } from '@paralleldrive/cuid2';
import {
  FeedType,
  NotificationType,
  PostPrivacy,
  PostStatus,
  Prisma,
  Privacy,
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { Filter } from 'bad-words';
import * as cheerio from 'cheerio';
import JSZip from 'jszip';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure, publicProcedure } from '../trpc';

export const postRouter = createTRPCRouter({
  createPost: privateProcedure
    .input(
      z.object({
        text: z.string().optional(),
        threadText: z.string().optional(),
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
              mentionedUserId: z.string(),
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
        hideLikes: z.boolean().optional(),
        turnOffComments: z.boolean().optional(),
      })
    )
    .mutation(
      async ({
        ctx,
        input: {
          text,
          threadText,
          media,
          mentions,
          privacy,
          quoteId,
          linkPreview,
          hideLikes,
          turnOffComments,
        },
      }) => {
        const { user, userId, db } = ctx;
        const email = getUserEmail(user);
        const dbUser = await db.user.findUnique({
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
        const textToPost = text || threadText || '';
        const filteredText = filter.clean(textToPost);
        const hashtags = extractHashtags(filteredText);

        const transactionResult = await db.$transaction(async (prisma) => {
          let lPreview;

          if (linkPreview) {
            lPreview = await prisma.linkPreview.upsert({
              where: { url: linkPreview?.url },
              update: {},
              create: {
                url: linkPreview?.url || '',
                title: linkPreview?.title,
                description: linkPreview?.description,
                image: linkPreview?.image,
              },
            });
          }

          const postId = createId();
          const path = `/${postId}/`;

          const mediaWithAspectRatio = media?.map((item) => ({
            ...item,
            aspectRatio: item.aspectRatio || '1:1',
          }));

          const newpost = await prisma.post.create({
            data: {
              id: postId,
              ...(text && { text: filteredText }),
              ...(threadText && { threadText: filteredText }),
              authorId: userId,
              media: mediaWithAspectRatio,
              privacy,
              quoteId,
              path,
              linkPreviewUrl: linkPreview?.url,
              hideLikes,
              turnOffComments,
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

          // if (mentions?.length) {
          //   await Promise.all(
          //     mentions.map((mention) =>
          //       prisma.notification.create({
          //         data: {
          //           type: 'MENTION',
          //           senderUserId: userId,
          //           receiverUserId: mention.userId,
          //           postId: newpost.id,
          //           message: filteredText,
          //         },
          //       })
          //     )
          //   );
          // }

          return {
            newpost,
          };
        });

        if (!transactionResult) {
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        }

        return {
          post: transactionResult.newpost,
          success: true,
          isEdited: false,
        };
      }
    ),

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
      async ({ input: { limit = 15, cursor, searchQuery, sortBy }, ctx }) => {
        const { userId, db } = ctx;

        const userFilteredKeywords = await db.filteredKeyword.findMany({
          where: {
            userId,
            feeds: { has: FeedType.FOR_YOU },
          },
          select: {
            keyword: true,
          },
        });

        const baseConditions: Prisma.PostWhereInput[] = [
          getPrivacyFilter(userId),
          { status: PostStatus.VISIBLE },
          { parentPostId: null },
          { hiddenBy: { none: { userId } } },
          {
            author: {
              deactivated: false,
              mutedByUsers: { none: { mutedByUserId: userId } },
              blockedByUsers: { none: { blockingUserId: userId } },
              blockedUsers: { none: { blockedUserId: userId } },
            },
          },
        ];

        if (searchQuery) {
          baseConditions.push({
            OR: [
              { text: { contains: searchQuery, mode: 'insensitive' } },
              {
                hashtags: {
                  some: {
                    name: { contains: searchQuery, mode: 'insensitive' },
                  },
                },
              },
            ],
          });
        } else if (userFilteredKeywords.length > 0) {
          const keywords = userFilteredKeywords.map((k) => k.keyword);

          keywords.forEach((keyword) => {
            baseConditions.push({
              AND: [
                {
                  OR: [
                    {
                      text: { not: { contains: keyword } },
                    },
                    { text: null },
                  ],
                },
                {
                  OR: [
                    {
                      threadText: {
                        not: { contains: keyword },
                      },
                    },
                    { threadText: null },
                  ],
                },
                {
                  hashtags: {
                    none: {
                      name: { equals: keyword, mode: 'insensitive' },
                    },
                  },
                },
              ],
            });
          });
        }

        const whereClause: Prisma.PostWhereInput = {
          AND: baseConditions,
        };

        const posts = await db.post.findMany({
          where: whereClause,
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
            threadText: true,
            media: true,
            parentPostId: true,
            quoteId: true,
            path: true,
            hideLikes: true,
            turnOffComments: true,
            pinned: true,
            privacy: true,
            repliesCount: true,
            status: true,
            author: {
              select: {
                ...GET_USER,
              },
            },
            ...getLikesWithBlockFilter(userId),
            ...getBookmarksWithBlockFilter(userId),
            ...getPostRepliesCount(userId),
            ...GET_MENTIONS,
            ...GET_LINK_PREVIEW,
            reposts: {
              ...GET_REPOSTS,
              where: {
                user: {
                  deactivated: false,
                  blockedByUsers: {
                    none: {
                      blockingUserId: {
                        equals: userId,
                      },
                    },
                  },
                  blockedUsers: {
                    none: {
                      blockedUserId: {
                        equals: userId,
                      },
                    },
                  },
                },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        });

        const formattedPosts = posts.map((post) => ({
          ...post,
          media: post.media as PostMedia[],
          likesCount: post.likes.length,
          repostsCount: post.reposts.length,
          repliesCount: getTotalRepliesCount(post) as number,
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
              username: z.string(),
              index: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      try {
        const transactionResult = await db.$transaction(async (prisma) => {
          const filter = new Filter();
          const filteredText = filter.clean(input.text);
          const hashtags = extractHashtags(filteredText);
          const postId = createId();

          const parentPost = await prisma.post.findUnique({
            where: { id: input.postId },
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

          if (!parentPost) {
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Parent post not found',
            });
          }

          const blockedUsers = parentPost.author.blockedUsers.map(
            (blockedUser) => blockedUser.blockedUserId
          );

          const isBlocked = blockedUsers.includes(userId);

          if (isBlocked) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }

          const parentPath = parentPost.path ?? `/${parentPost.id}`;
          const path = `${parentPath}/${postId}/`;
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

          if (input.mentions && input.mentions.length > 0) {
            const uniqueUsernames = Array.from(
              new Set(input.mentions.map((m) => m.username))
            );

            const mentionedUsers = await prisma.user.findMany({
              where: {
                username: {
                  in: uniqueUsernames,
                },
              },
              select: {
                id: true,
                username: true,
              },
            });

            const usernameToIdMap = new Map(
              mentionedUsers.map((user) => [user.username, user.id])
            );

            const validMentions = input.mentions.filter((mention) =>
              usernameToIdMap.has(mention.username)
            );

            if (validMentions.length > 0) {
              await prisma.mention.createMany({
                data: validMentions.map((mention) => ({
                  postId,
                  userId: usernameToIdMap.get(mention.username)!,
                  index: mention.index,
                })),
                skipDuplicates: true,
              });

              const mentionNotifications = mentionedUsers
                .filter((user) => user.id !== userId)
                .map((user) => ({
                  type: NotificationType.MENTION,
                  senderUserId: userId,
                  receiverUserId: user.id,
                  postId: input.postId,
                  message: `mentioned you in a comment: ${filteredText}`,
                }));

              if (mentionNotifications.length > 0) {
                await prisma.notification.createMany({
                  data: mentionNotifications,
                });
              }
            }
          }

          if (userId !== input.postAuthor) {
            await prisma.notification.create({
              data: {
                type: NotificationType.COMMENT,
                senderUserId: userId,
                receiverUserId: input.postAuthor,
                postId: input.postId,
                message: `commented: ${filteredText}`,
              },
            });
          }

          return { repliedPost };
        });

        if (!transactionResult) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create reply',
          });
        }

        return {
          createPost: transactionResult.repliedPost,
          success: true,
        };
      } catch (error) {
        console.error('Error in replyToPost:', error);
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
        originalPostId: z.string(),
        text: z.string().min(1, {
          message: 'Reply cannot be empty',
        }),
        mentions: z
          .array(
            z.object({
              username: z.string(),
              index: z.number(),
            })
          )
          .optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      try {
        const transactionResult = await db.$transaction(async (prisma) => {
          const filter = new Filter();
          const filteredText = filter.clean(input.text);
          const hashtags = extractHashtags(filteredText);
          const replyId = createId();

          const parentComment = await prisma.post.findUnique({
            where: { id: input.parentCommentId },
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
            (blockedUser) => blockedUser.blockedUserId
          );

          const isBlocked = blockedUsers.includes(userId);

          if (isBlocked) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
          const parentPath = parentComment.path ?? `/${parentComment.id}`;
          const path = `${parentPath}${replyId}/`;

          const ancestorIds = parentPath.split('/').filter(Boolean);

          await prisma.post.updateMany({
            where: { id: { in: ancestorIds } },
            data: { repliesCount: { increment: 1 } },
          });

          const reply = await prisma.post.create({
            data: {
              id: replyId,
              text: filteredText,
              authorId: userId,
              parentPostId: input.parentCommentId,
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
            },
            select: {
              id: true,
              author: true,
            },
          });

          if (input.mentions && input.mentions.length > 0) {
            const uniqueUsernames = Array.from(
              new Set(input.mentions.map((m) => m.username))
            );

            const mentionedUsers = await prisma.user.findMany({
              where: {
                username: {
                  in: uniqueUsernames,
                },
              },
              select: {
                id: true,
                username: true,
              },
            });

            const usernameToIdMap = new Map(
              mentionedUsers.map((user) => [user.username, user.id])
            );

            const validMentions = input.mentions.filter((mention) =>
              usernameToIdMap.has(mention.username)
            );

            if (validMentions.length > 0) {
              await prisma.mention.createMany({
                data: validMentions.map((mention) => ({
                  postId: reply.id,
                  userId: usernameToIdMap.get(mention.username)!,
                  index: mention.index,
                })),
                skipDuplicates: true,
              });

              const mentionNotifications = mentionedUsers
                .filter((user) => user.id !== userId)
                .map((user) => ({
                  type: NotificationType.MENTION,
                  senderUserId: userId,
                  receiverUserId: user.id,
                  postId: input.originalPostId,
                  message: `mentioned you in a comment: ${filteredText}`,
                }));

              if (mentionNotifications.length > 0) {
                await prisma.notification.createMany({
                  data: mentionNotifications,
                });
              }
            }
          }

          if (userId !== parentComment.authorId) {
            await prisma.notification.create({
              data: {
                type: NotificationType.COMMENT,
                senderUserId: userId,
                receiverUserId: parentComment.authorId,
                postId: input.originalPostId,
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

  getPostDetails: privateProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { id } = input;
      const { db, userId } = ctx;

      const post = await db.post.findUnique({
        where: {
          id,
          status: PostStatus.VISIBLE,
          hiddenBy: {
            none: {
              userId,
            },
          },
          author: {
            deactivated: false,
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
        select: {
          id: true,
          createdAt: true,
          text: true,
          threadText: true,
          media: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          hideLikes: true,
          turnOffComments: true,
          pinned: true,
          privacy: true,
          repliesCount: true,
          author: {
            select: {
              ...GET_USER,
              followers: {
                where: {
                  followerId: userId,
                },
                select: {
                  followerId: true,
                },
              },
            },
          },
          ...getLikesWithBlockFilter(userId),
          ...getBookmarksWithBlockFilter(userId),
          ...getPostRepliesCount(userId),
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
          reposts: {
            ...GET_REPOSTS,
            where: {
              user: {
                deactivated: false,
                blockedByUsers: {
                  none: {
                    blockingUserId: {
                      equals: userId,
                    },
                  },
                },
                blockedUsers: {
                  none: {
                    blockedUserId: {
                      equals: userId,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found' });
      }

      const isPublic = post.author.privacy === Privacy.PUBLIC;
      const isOwnPost = post.author.id === userId;

      const isFollowing = post.author.followers.length > 0;

      if (!isPublic && !isOwnPost && !isFollowing) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not have permission to view this post.',
        });
      }

      return {
        post: {
          ...post,
          media: post.media as PostMedia[],
          likesCount: post.likes.length,
          repostsCount: post.reposts.length,
          repliesCount: getTotalRepliesCount(post) as number,
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
        sortBy: z.enum(['LATEST', 'OLDEST']),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { id, limit, cursor, sortBy } = input;
      const { userId, db } = ctx;

      const comments = await db.post.findMany({
        where: {
          parentPostId: id,
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
        select: {
          id: true,
          createdAt: true,
          text: true,
          threadText: true,
          media: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          pinned: true,
          privacy: true,
          reposts: {
            where: {
              user: {
                deactivated: false,
              },
            },
            ...GET_REPOSTS,
            orderBy: {
              createdAt: 'desc',
            },
          },
          ...getAuthorAndHiddenSelect(userId!),
          ...getLikesWithBlockFilter(userId!),
          ...getBookmarksWithBlockFilter(userId!),
          ...getCommentRepliesCount(userId!),
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
        },
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
        media: comment.media as PostMedia[],
        likesCount: comment.likes.length,
        repostsCount: comment.reposts.length,
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

  getReplies: publicProcedure
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
      })
    )
    .query(async ({ input, ctx }) => {
      const { parentCommentId, limit, cursor } = input;
      const { userId, db } = ctx;

      const replies = await db.post.findMany({
        where: {
          parentPostId: parentCommentId,
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
        select: {
          id: true,
          createdAt: true,
          text: true,
          threadText: true,
          media: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          pinned: true,
          privacy: true,
          reposts: {
            where: {
              user: {
                deactivated: false,
              },
            },
            ...GET_REPOSTS,
            orderBy: {
              createdAt: 'desc',
            },
          },
          ...getAuthorAndHiddenSelect(userId!),
          ...getLikesWithBlockFilter(userId!),
          ...getBookmarksWithBlockFilter(userId!),
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
        },
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
        media: reply.media as PostMedia[],
        likesCount: reply.likes.length,
        repostsCount: reply.reposts.length,
        bookmarksCount: new Set(
          reply.bookmarks.map((bookmark) => bookmark.userId)
        ).size,
        type: 'post' as const,
        isHidden: reply.hiddenBy.length > 0,
        isMuted: reply.author.mutedByUsers?.length > 0,
      }));

      return {
        replies: formattedReplies,
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
      const { userId, db } = ctx;
      const data = { postId: id, userId };

      const existingRepost = await db.repost.findUnique({
        where: {
          postId_userId: data,
        },
      });

      if (existingRepost == null) {
        const transactionResult = await db.$transaction(async (prisma) => {
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
              postId_userId: data,
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

  toggleHideLikes: privateProcedure
    .input(
      z.object({
        postId: z.string(),
        hide: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;
      const post = await db.post.findUnique({
        where: { id: input.postId },
        select: { authorId: true },
      });

      if (!post || post.authorId !== userId) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      await db.post.update({
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
      const { userId, db } = ctx;
      const postInfo = await db.post.findUnique({
        where: {
          id: input.id,
        },
        select: {
          id: true,
          createdAt: true,
          text: true,
          threadText: true,
          media: true,
          path: true,
          repliesCount: true,
          privacy: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...getLikesWithBlockFilter(userId!),
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
          likeCount: postInfo.likes.length,
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
      const { db } = ctx;
      try {
        await db.$transaction(async (prisma) => {
          const postToDelete = await prisma.post.findUnique({
            where: { id: input.id },
          });

          if (!postToDelete) {
            throw new TRPCError({ code: 'NOT_FOUND' });
          }

          await prisma.post.delete({
            where: {
              id: input.id,
            },
          });

          return { success: true };
        });

        return { success: true };
      } catch (error) {
        console.error('Error in deletePost:', error);

        if (error instanceof TRPCError) {
          throw error;
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete post',
        });
      }
    }),

  deleteRepost: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, db } = ctx;

      const data = { postId: input.id, userId };
      const transactionResult = await db.$transaction(async (prisma) => {
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
      const { userId, db } = ctx;

      const collections = await db.collection.findMany({
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
                        userId,
                      },
                    },
                  },
                  {
                    author: {
                      mutedByUsers: {
                        none: {
                          mutedByUserId: userId,
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
                  threadText: true,
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
                  turnOffComments: true,
                  pinned: true,
                  privacy: true,
                  replies: true,
                  author: {
                    select: {
                      ...GET_USER,
                    },
                  },
                  ...getLikesWithBlockFilter(userId),
                  reposts: {
                    ...GET_REPOSTS,
                    orderBy: {
                      createdAt: 'desc',
                    },
                  },
                  ...getBookmarksWithBlockFilter(userId),
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
          likesCount: bookmark.post.likes.length,
          repostsCount: bookmark.post.reposts.length,
          repliesCount: bookmark.post.replies.length,
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
      const { userId, db } = ctx;
      const likedPosts = await db.like.findMany({
        where: {
          userId,
          post: {
            AND: [
              {
                hiddenBy: {
                  none: {
                    userId,
                  },
                },
              },
              {
                author: {
                  mutedByUsers: {
                    none: {
                      mutedByUserId: userId,
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
              threadText: true,
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
              turnOffComments: true,
              pinned: true,
              privacy: true,
              replies: true,
              author: {
                select: {
                  ...GET_USER,
                },
              },
              ...getLikesWithBlockFilter(userId),
              reposts: {
                ...GET_REPOSTS,
                orderBy: {
                  createdAt: 'desc',
                },
              },
              ...getBookmarksWithBlockFilter(userId),
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
          likesCount: likedPost.post.likes.length,
          repostsCount: likedPost.post.reposts.length,
          repliesCount: likedPost.post.replies.length,
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
      const { userId, db } = ctx;

      const userFilteredKeywords = await db.filteredKeyword.findMany({
        where: {
          userId,
          feeds: { has: FeedType.FOLLOWING },
        },
        select: {
          keyword: true,
        },
      });

      const whereClause: Prisma.PostWhereInput = {
        AND: [
          getPrivacyFilter(userId),
          {
            OR: [
              {
                author: {
                  followers: {
                    some: { followerId: userId },
                  },
                },
              },
              {
                reposts: {
                  some: {
                    user: {
                      followers: {
                        some: { followerId: userId },
                      },
                    },
                  },
                },
                NOT: {
                  authorId: userId,
                },
              },
            ],
          },
          { parentPostId: null },
          { status: PostStatus.VISIBLE },
          { hiddenBy: { none: { userId } } },
          {
            author: {
              deactivated: false,
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
        ],
      };

      if (userFilteredKeywords.length > 0) {
        const keywords = userFilteredKeywords.map((k) => k.keyword);

        keywords.forEach((keyword) => {
          (whereClause.AND as Prisma.PostWhereInput[]).push({
            AND: [
              {
                OR: [{ text: { not: { contains: keyword } } }, { text: null }],
              },
              {
                OR: [
                  {
                    threadText: {
                      not: { contains: keyword },
                    },
                  },
                  { threadText: null },
                ],
              },
              {
                hashtags: {
                  none: {
                    name: { equals: keyword, mode: 'insensitive' },
                  },
                },
              },
            ],
          });
        });
      }

      const followingPosts = await db.post.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          text: true,
          threadText: true,
          createdAt: true,
          media: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          hideLikes: true,
          turnOffComments: true,
          pinned: true,
          privacy: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          reposts: {
            where: {
              user: {
                deactivated: false,
              },
            },
            ...GET_REPOSTS,
            orderBy: {
              createdAt: 'desc',
            },
          },
          ...getLikesWithBlockFilter(userId),
          ...getBookmarksWithBlockFilter(userId),
          ...getPostRepliesCount(userId),
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
          repost.user.followers.some((follow) => follow.followerId === userId)
        );

        return {
          ...post,
          media: post.media as PostMedia[],
          likesCount: post.likes.length,
          repostsCount: post.reposts.length,
          repliesCount: getTotalRepliesCount(post) as number,
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
      const { userId, db } = ctx;
      const whereClause: Prisma.PostWhereInput = {
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
          getPrivacyFilter(userId!),
          { status: PostStatus.VISIBLE },
          {
            hiddenBy: {
              none: {
                userId,
              },
            },
          },
          {
            author: {
              deactivated: false,
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
        ],
      };
      const posts = await db.post.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          createdAt: true,
          text: true,
          threadText: true,
          media: true,
          parentPostId: true,
          quoteId: true,
          path: true,
          hideLikes: true,
          turnOffComments: true,
          pinned: true,
          privacy: true,
          author: {
            select: {
              ...GET_USER,
            },
          },
          ...getLikesWithBlockFilter(userId!),
          ...getBookmarksWithBlockFilter(userId!),
          ...getPostRepliesCount(userId!),
          reposts: {
            where: {
              user: {
                deactivated: false,
              },
            },
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
        likesCount: post.likes.length,
        repostsCount: post.reposts.length,
        repliesCount: getTotalRepliesCount(post) as number,
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
        text: z.string().optional(),
        threadText: z.string().optional(),
        mentions: z
          .array(
            z.object({
              username: z.string(),
              index: z.number(),
            })
          )
          .optional(),
        hideLikes: z.boolean().optional(),
        turnOffComments: z.boolean().optional(),
      })
    )
    .mutation(
      async ({
        ctx,
        input: { id, text, threadText, mentions, hideLikes, turnOffComments },
      }) => {
        const { userId, db } = ctx;

        try {
          const post = await db.post.findUnique({
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
              threadText: true,
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
          const textToPost = text || threadText || '';
          const filteredText = filter.clean(textToPost);

          const hashtags = extractHashtags(filteredText);

          const existingMentionUserIds = new Set(
            post.mentions.map((mention) => mention.userId)
          );

          const transactionResult = await db.$transaction(async (prisma) => {
            let newMentionUserIds = new Set<string>();

            await prisma.mention.deleteMany({
              where: {
                postId: id,
              },
            });

            await prisma.post.update({
              where: { id },
              data: {
                hashtags: {
                  disconnect: post.hashtags.map((tag) => ({
                    name: tag.name,
                  })),
                },
              },
            });

            if (mentions && mentions.length > 0) {
              const uniqueUsernames = Array.from(
                new Set(mentions.map((m) => m.username))
              );

              const mentionedUsers = await prisma.user.findMany({
                where: {
                  username: {
                    in: uniqueUsernames,
                  },
                },
                select: {
                  id: true,
                  username: true,
                },
              });

              const usernameToIdMap = new Map(
                mentionedUsers.map((user) => [user.username, user.id])
              );

              const validMentions = mentions.filter((mention) =>
                usernameToIdMap.has(mention.username)
              );

              if (validMentions.length > 0) {
                await prisma.mention.createMany({
                  data: validMentions.map((mention) => ({
                    postId: id,
                    userId: usernameToIdMap.get(mention.username)!,
                    index: mention.index,
                  })),
                  skipDuplicates: true,
                });

                newMentionUserIds = new Set(
                  mentionedUsers
                    .map((user) => user.id)
                    .filter(
                      (id) => !existingMentionUserIds.has(id) && id !== userId
                    )
                );

                if (newMentionUserIds.size > 0) {
                  await prisma.notification.createMany({
                    data: Array.from(newMentionUserIds).map(
                      (mentionedUserId) => ({
                        type: NotificationType.MENTION,
                        message: filteredText,
                        senderUserId: userId,
                        receiverUserId: mentionedUserId,
                        postId: id,
                      })
                    ),
                  });
                }
              }
            }

            const updatedPost = await prisma.post.update({
              where: { id },
              data: {
                ...(text && { text: filteredText }),
                ...(threadText && { threadText: filteredText }),
                lastEditedAt: new Date(),
                hideLikes: hideLikes,
                turnOffComments: turnOffComments,
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

            return {
              updatedPost,
              newMentionCount: newMentionUserIds.size,
            };
          });

          if (!transactionResult) {
            throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
          }

          return {
            post: transactionResult.updatedPost,
            success: true,
            isEdited: true,
          };
        } catch (error) {
          console.error('Error in editPost:', error);
          if (error instanceof TRPCError) {
            throw error;
          }
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update post. Please try again.',
          });
        }
      }
    ),

  toggleHidePost: privateProcedure
    .input(
      z.object({
        postId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      const data = { postId: input.postId, userId };

      const existingHiddenPost = await db.hiddenPost.findUnique({
        where: {
          postId_userId: data,
        },
      });

      if (existingHiddenPost == null) {
        await db.hiddenPost.create({
          data,
        });
        return { hidden: true };
      } else {
        await db.hiddenPost.delete({
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
      const { userId, db } = ctx;
      const postExists = await db.post.findUnique({
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

      await db.post.update({
        where: { id: input.postId },
        data: { pinned: !postExists.pinned },
      });

      return { pinned: !postExists.pinned };
    }),

  getLinkInfo: publicProcedure
    .input(z.object({ url: z.string().url('Invalid URL') }))
    .query(async ({ input }) => {
      try {
        const response = await fetch(input.url);
        if (
          !response.ok ||
          !response.headers.get('content-type')?.includes('text/html')
        ) {
          return null;
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        const preview = {
          url: input.url,
          title:
            $('meta[property="og:title"]').attr('content') ||
            $('title').text() ||
            '',
          description:
            $('meta[property="og:description"]').attr('content') ||
            $('meta[name="description"]').attr('content') ||
            '',
          image: $('meta[property="og:image"]').attr('content') || null,
        };

        if (!preview.title && !preview.description && !preview.image) {
          return null;
        }

        console.log('Preview: ', preview);

        return preview;
      } catch (error) {
        console.error('Failed to fetch link preview:', error);
        return null;
      }
    }),

  downloadUserData: privateProcedure
    .input(
      z.object({
        options: z.array(z.nativeEnum(DownloadableData)),
        format: z.enum(['txt', 'json']).default('txt'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;
      const { options, format } = input;
      const zip = new JSZip();
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || '';
      const noDataMessage = 'You have no data in this section';

      const jsonData: Record<string, any> = {};

      if (options.includes(DownloadableData.Posts)) {
        const posts = await db.post.findMany({
          where: {
            authorId: userId,
            parentPostId: null,
          },
          select: {
            id: true,
            createdAt: true,
            _count: {
              select: { likes: true },
            },
            privacy: true,
            turnOffComments: true,
            text: true,
            threadText: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });
        if (format === 'json') {
          jsonData.Post = {
            Posts: posts.map((post) => ({
              Date: formatDateAndTime(post.createdAt),
              Link: `${baseUrl}/post/${post.id}`,
              Likes: post._count.likes.toString(),
              WhoCanView: capitalizeFirstLetter(post.privacy.toLowerCase()),
              AllowComments: post.turnOffComments ? 'No' : 'Yes',
              Text: post.text ?? post.threadText ?? 'N/A',
            })),
          };
        } else {
          let postsContent = '';
          for (const post of posts) {
            const postData = [
              `Datetime: ${formatUTCDate(post.createdAt)}`,
              `Link: ${baseUrl}/post/${post.id}`,
              `Likes: ${post._count.likes}`,
              `Who can view: ${capitalizeFirstLetter(post.privacy)}`,
              `Allow comments: ${post.turnOffComments ? 'No' : 'Yes'}`,
              `Text: ${post.text ?? post.threadText ?? 'N/A'}`,
            ];
            postsContent += postData.join('\n') + '\n\n';
          }
          zip
            .folder('Posts')
            ?.file('Posts.txt', postsContent.trim() || noDataMessage);
        }
      }

      if (options.includes(DownloadableData.Comments)) {
        const comments = await db.post.findMany({
          where: {
            authorId: userId,
            parentPostId: { not: null },
          },
          select: {
            createdAt: true,
            text: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        });

        if (format === 'json') {
          jsonData.Comment = {
            Comments: {
              CommentsList: comments.map((comment) => ({
                date: formatDateAndTime(comment.createdAt),
                comment: comment.text,
              })),
            },
          };
        } else {
          let commentsContent = '';
          for (const comment of comments) {
            const commentData = [
              `Date: ${formatUTCDate(comment.createdAt)}`,
              `Comment: ${comment.text}`,
            ];
            commentsContent += commentData.join('\n') + '\n\n';
          }

          zip
            .folder('Comments')
            ?.file('Comments.txt', commentsContent.trim() || noDataMessage);
        }
      }

      if (options.includes(DownloadableData.DirectMessages)) {
        const chats = await db.chat.findMany({
          where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
            messages: { some: {} },
          },
          select: {
            sender: { select: { id: true, username: true } },
            receiver: { select: { id: true, username: true } },
            messages: {
              select: {
                createdAt: true,
                content: true,
                sender: { select: { username: true } },
              },
              orderBy: {
                createdAt: 'desc',
              },
            },
          },
        });
        if (format === 'json') {
          const chatHistory = chats.reduce((acc, chat) => {
            const partner =
              chat.sender?.id === userId ? chat.receiver : chat.sender;
            if (partner) {
              acc[`Chat History with ${partner.username}:`] = chat.messages.map(
                (msg) => ({
                  Date: formatDateAndTime(msg.createdAt),
                  From: msg.sender?.username ?? 'Unknown User',
                  Content: msg.content,
                })
              );
            }
            return acc;
          }, {} as Record<string, any>);

          jsonData['Direct Message'] = {
            'Direct Messages': { ChatHistory: chatHistory },
          };
        } else {
          let dmContent = '';
          for (const chat of chats) {
            const partner =
              chat.sender?.id === userId ? chat.receiver : chat.sender;

            if (!partner) continue;

            dmContent += `>>> Chat History with ${partner.username}::\n\n`;

            for (const message of chat.messages) {
              const senderUsername = message.sender?.username ?? 'Unknown User';
              dmContent += `${formatUTCDate(
                message.createdAt
              )} ${senderUsername}: ${message.content}\n`;
            }
            dmContent += '\n';
          }
          zip
            .folder('Direct Messages')
            ?.file('Direct Messages.txt', dmContent.trim() || noDataMessage);
        }
      }

      if (options.includes(DownloadableData.LikesAndFavorites)) {
        const [bookmarks, likes] = await Promise.all([
          db.bookmark.findMany({
            where: { userId },
            select: { createdAt: true, post: { select: { id: true } } },
            orderBy: { createdAt: 'desc' },
          }),
          db.like.findMany({
            where: { userId },
            select: { createdAt: true, post: { select: { id: true } } },
            orderBy: { createdAt: 'desc' },
          }),
        ]);

        if (format === 'json') {
          jsonData['Likes and Favorites'] = {
            'Favorite Items': {
              FavoriteItemList: bookmarks.map((b) => ({
                Date: formatDateAndTime(b.createdAt),
                Link: `${baseUrl}/post/${b.post.id}`,
              })),
            },
            'Like List': {
              ItemFavoriteList: likes.map((l) => ({
                date: formatDateAndTime(l.createdAt),
                link: `${baseUrl}/post/${l.post.id}`,
              })),
            },
          };
        } else {
          const likesAndFavoritesFolder = zip.folder('Likes and Favorites');
          let favoritesContent = '';
          for (const bookmark of bookmarks) {
            if (bookmark.post) {
              favoritesContent += `Date: ${formatUTCDate(
                bookmark.createdAt
              )}\nLink: ${baseUrl}/post/${bookmark.post.id}\n\n`;
            }
          }
          likesAndFavoritesFolder?.file(
            'Favorite Items.txt',
            favoritesContent.trim() || noDataMessage
          );
          let likesContent = '';
          for (const like of likes) {
            if (like.post) {
              likesContent += `Date: ${formatUTCDate(
                like.createdAt
              )}\nLink: ${baseUrl}/post/${like.post.id}\n\n`;
            }
          }
          likesAndFavoritesFolder?.file(
            'Like List.txt',
            likesContent.trim() || noDataMessage
          );
        }
      }

      if (options.includes(DownloadableData.ProfileAndSettings)) {
        const [
          userProfile,
          blockedUsers,
          mutedUsers,
          followers,
          following,
          filteredKeywords,
        ] = await Promise.all([
          db.user.findUnique({
            where: { id: userId },
            select: {
              image: true,
              username: true,
              email: true,
              bio: true,
              privacy: true,
              _count: { select: { followers: true, following: true } },
            },
          }),
          db.blockedUser.findMany({
            where: { blockingUserId: userId },
            select: {
              createdAt: true,
              blockedUser: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' },
          }),
          db.mutedUser.findMany({
            where: { mutedByUserId: userId },
            select: {
              createdAt: true,
              mutedUser: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' },
          }),
          db.follow.findMany({
            where: { followingId: userId },
            select: {
              createdAt: true,
              follower: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' },
          }),
          db.follow.findMany({
            where: { followerId: userId },
            select: {
              createdAt: true,
              following: { select: { username: true } },
            },
            orderBy: { createdAt: 'desc' },
          }),
          db.filteredKeyword.findMany({
            where: { userId },
            select: { keyword: true, feeds: true },
          }),
        ]);

        const totalLikesReceived = await db.like.count({
          where: { post: { authorId: userId } },
        });

        const forYouKeywords = filteredKeywords
          .filter((fk) => fk.feeds.includes(FeedType.FOR_YOU))
          .map((fk) => fk.keyword);

        const followingKeywords = filteredKeywords
          .filter((fk) => fk.feeds.includes(FeedType.FOLLOWING))
          .map((fk) => fk.keyword);

        const privateAccountStatus =
          userProfile?.privacy === Privacy.PRIVATE ? 'Enabled' : 'Disabled';

        if (format === 'json' && userProfile) {
          jsonData['Profile And Settings'] = {
            'Block List': {
              BlockList: blockedUsers.map((u) => ({
                Date: formatDateAndTime(u.createdAt),
                Username: u.blockedUser.username,
              })),
            },
            'Mute List': {
              MuteList: mutedUsers.map((u) => ({
                Date: formatDateAndTime(u.createdAt),
                Username: u.mutedUser.username,
              })),
            },
            Follower: {
              FansList: followers.map((u) => ({
                Date: formatDateAndTime(u.createdAt),
                Username: u.follower.username,
              })),
            },
            Following: {
              Following: following.map((u) => ({
                Date: formatDateAndTime(u.createdAt),
                Username: u.following.username,
              })),
            },
            'Profile Info': {
              ProfileMap: {
                bioDescription: userProfile.bio ?? '...',
                displayName: userProfile.username,
                emailAddress: userProfile.email ?? 'None',
                followerCount: userProfile._count.followers,
                followingCount: userProfile._count.following,
                likesReceived: totalLikesReceived.toString(),
                profilePhoto: userProfile.image ?? '',
                username: userProfile.username,
              },
            },
            Settings: {
              SettingsMap: {
                'Content Preferences': {
                  'Keyword filters for videos in Following feed':
                    followingKeywords,
                  'Keyword filters for videos in For You feed': forYouKeywords,
                },
                'Private Account': privateAccountStatus,
              },
            },
          };
        } else {
          const profileFolder = zip.folder('Profile and Settings');
          let blockContent = '';
          for (const user of blockedUsers) {
            blockContent += `Date: ${formatUTCDate(
              user.createdAt
            )}\nUsername: ${user.blockedUser.username}\n\n`;
          }
          profileFolder?.file(
            'Block List.txt',
            blockContent.trim() || noDataMessage
          );

          let muteContent = '';
          for (const user of mutedUsers) {
            muteContent += `Date: ${formatUTCDate(user.createdAt)}\nUsername: ${
              user.mutedUser.username
            }\n\n`;
          }
          profileFolder?.file(
            'Mute List.txt',
            muteContent.trim() || noDataMessage
          );

          let followContent = '';
          for (const user of followers) {
            followContent += `Date: ${formatUTCDate(
              user.createdAt
            )}\nUsername: ${user.follower.username}\n\n`;
          }
          profileFolder?.file(
            'Follower.txt',
            followContent.trim() || noDataMessage
          );

          let followingContent = '';
          for (const user of following) {
            followingContent += `Date: ${formatUTCDate(
              user.createdAt
            )}\nUsername: ${user.following.username}\n\n`;
          }
          profileFolder?.file(
            'Following.txt',
            followingContent.trim() || noDataMessage
          );

          if (userProfile) {
            const profileData = [
              `Profile Photo: ${userProfile.image ?? 'None'}`,
              `Username: ${userProfile.username}`,
              `Email Address: ${userProfile.email ?? 'None'}`,
              `Bio Description: ${userProfile.bio ?? '...'}`,
              `Like(s) Received: ${totalLikesReceived}`,
            ];
            const profileInfoContent = profileData.join('\n');
            profileFolder?.file(
              'Profile Information.txt',
              profileInfoContent.trim() || noDataMessage
            );

            const settingsData = [
              `Private Account: ${privateAccountStatus}`,
              `Keyword filters for videos in For You feed: [${forYouKeywords.join(
                ', '
              )}]`,
              `Keyword filters for videos in Following feed: [${followingKeywords.join(
                ', '
              )}]`,
            ];
            const settingsContent = settingsData.join('\n');
            profileFolder?.file(
              'Settings.txt',
              settingsContent.trim() || noDataMessage
            );
          }
        }
      }

      if (format === 'json' && Object.keys(jsonData).length > 0) {
        zip.file('user_data_muted.json', JSON.stringify(jsonData, null, 2));
      }

      const zipAsBase64 = await zip.generateAsync({ type: 'base64' });

      return {
        zipData: zipAsBase64,
      };
    }),
});
