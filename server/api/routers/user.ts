import { PostMedia } from '@/lib/types';
import { getUserEmail } from '@/lib/utils';
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
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  userInfo: privateProcedure
    .input(
      z.object({
        username: z.string(),
      })
    )
    .query(async ({ input, ctx }) => {
      const isUser = await ctx.db.user.findUnique({
        where: {
          username: input.username,
        },
      });

      if (!isUser) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const userProfileInfo = await ctx.db.user.findUnique({
        where: {
          username: input.username,
        },
        include: {
          followers: true,
          following: true,
        },
      });

      if (!userProfileInfo) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      return {
        userDetails: {
          id: userProfileInfo.id,
          image: userProfileInfo.image,
          fullName: userProfileInfo.fullName,
          username: userProfileInfo.username,
          bio: userProfileInfo.bio,
          link: userProfileInfo.link,
          privacy: userProfileInfo.privacy,
          createdAt: userProfileInfo.createdAt,
          isAdmin: userProfileInfo.isAdmin,
          followers: userProfileInfo.followers,
          following: userProfileInfo.following,
        },
      };
    }),

  postInfo: privateProcedure
    .input(
      z.object({
        username: z.string(),
        filters: z
          .array(z.enum(['ALL', 'TEXT', 'REPLIES', 'REPOSTS']))
          .default(['ALL']),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(
      async ({ input: { username, filters, limit = 20, cursor }, ctx }) => {
        if (filters.includes('ALL') || filters.length === 0) {
          filters = ['ALL'];
        }
        const user = await ctx.db.user.findUnique({
          where: {
            username,
          },
          select: {
            id: true,
          },
        });

        if (!user) {
          throw new TRPCError({ code: 'NOT_FOUND' });
        }

        const filterConditions = filters.map((filter) => {
          switch (filter) {
            case 'TEXT':
              return {
                AND: [{ parentPostId: null }, { media: {} }],
              };
            case 'REPLIES':
              return {
                parentPostId: { not: null },
              };
            case 'REPOSTS':
              return {
                reposts: {
                  some: {
                    userId: user.id,
                  },
                },
              };
            default:
              return {};
          }
        });

        const posts = await ctx.db.post.findMany({
          where: {
            AND: [
              {
                OR: [
                  { authorId: user.id },
                  {
                    reposts: {
                      some: {
                        userId: user.id,
                      },
                    },
                  },
                ],
              },
              ...(filters[0] !== 'ALL' ? [{ OR: filterConditions }] : []),
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
            parentPost: {
              select: {
                id: true,
                createdAt: true,
                text: true,
                media: true,
                parentPostId: true,
                quoteId: true,
                path: true,
                parentPost: {
                  select: {
                    id: true,
                    ...getAuthorAndHiddenSelect(ctx.userId),
                  },
                },
                repliesCount: true,
                hideLikes: true,
                privacy: true,
                ...getAuthorAndHiddenSelect(ctx.userId),
                ...GET_LIKES,
                ...GET_BOOKMARKS,
                ...GET_COUNT,
                ...GET_REPOSTS,
                ...GET_MENTIONS,
                ...GET_LINK_PREVIEW,
              },
            },
            quoteId: true,
            path: true,
            repliesCount: true,
            hideLikes: true,
            privacy: true,
            ...getAuthorAndHiddenSelect(ctx.userId),
            ...GET_LIKES,
            ...GET_BOOKMARKS,
            ...GET_COUNT,
            ...GET_MENTIONS,
            ...GET_LINK_PREVIEW,
            reposts: {
              select: {
                createdAt: true,
                userId: true,
                postId: true,
                user: {
                  select: {
                    ...GET_USER,
                  },
                },
              },
            },
          },
        });

        let nextCursor: typeof cursor | undefined;

        if (posts.length > limit) {
          const nextItem = posts.pop();
          if (nextItem != null) {
            nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
          }
        }

        return {
          posts: posts.map((post) => {
            const userRepost = post.reposts.find(
              (repost) => repost.userId === user.id
            );
            return {
              id: post.id,
              createdAt: post.createdAt,
              text: post.text,
              parentPostId: post.parentPostId,
              parentPost: post.parentPost
                ? {
                    ...post.parentPost,
                    media: post.parentPost.media as PostMedia,
                    likesCount: post.parentPost._count.likes,
                    bookmarksCount: post.parentPost._count.bookmarks,
                    repostsCount: post.parentPost._count.reposts,
                    isMuted: post.parentPost.author.mutedByUsers.length > 0,
                    isHidden: post.parentPost.hiddenBy.length > 0,
                  }
                : null,
              author: post.author,
              likesCount: post._count.likes,
              likes: post.likes,
              path: post.path,
              repliesCount: post.repliesCount,
              hideLikes: post.hideLikes,
              quoteId: post.quoteId,
              media: post.media as PostMedia,
              reposts: post.reposts,
              mentions: post.mentions,
              linkPreview: post.linkPreview,
              bookmarks: post.bookmarks,
              bookmarksCount: post._count.bookmarks,
              privacy: post.privacy,
              isHidden: post.hiddenBy.length > 0,
              isMuted: post.author.mutedByUsers.length > 0,
              repostsCount: post._count.reposts,
              ...(userRepost && {
                repostedBy: userRepost.user,
                repostedAt: userRepost.createdAt,
              }),
            };
          }),
          nextCursor,
        };
      }
    ),

  updateProfile: privateProcedure
    .input(
      z.object({
        image: z.string().url().optional(),
        link: z
          .string()
          .optional()
          .refine(
            (value) => {
              return value === '' || z.string().url().safeParse(value).success;
            },
            {
              message: 'Invalid url',
            }
          ),
        bio: z.string().max(150).optional(),
        privacy: z.enum(['PUBLIC', 'PRIVATE']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { bio, link, image, privacy } = input;
      const email = getUserEmail(user);
      const dbUser = await ctx.db.user.findUnique({
        where: {
          email: email,
        },
        select: {
          id: true,
          image: true,
          verified: true,
        },
      });

      if (!dbUser) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: dbUser.id },
        data: {
          image,
          link,
          bio,
          privacy,
        },
      });

      return {
        updatedUser,
        success: true,
      };
    }),

  repliesInfo: privateProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { username, limit = 20, cursor }, ctx }) => {
      const isUser = await ctx.db.user.findUnique({
        where: {
          username,
        },
      });

      if (!isUser) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const userProfileInfo = await ctx.db.post.findMany({
        where: {
          author: {
            username,
          },
          parentPostId: {
            not: null,
          },
        },
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          createdAt: true,
          text: true,
          media: true,
          parentPostId: true,
          parentPost: {
            select: {
              id: true,
              createdAt: true,
              text: true,
              media: true,
              parentPostId: true,
              quoteId: true,
              path: true,
              parentPost: {
                select: {
                  id: true,
                  ...getAuthorAndHiddenSelect(ctx.userId),
                },
              },
              repliesCount: true,
              hideLikes: true,
              privacy: true,
              ...getAuthorAndHiddenSelect(ctx.userId),
              ...GET_LIKES,
              ...GET_BOOKMARKS,
              ...GET_COUNT,
              ...GET_REPOSTS,
              ...GET_MENTIONS,
              ...GET_LINK_PREVIEW,
            },
          },
          quoteId: true,
          path: true,
          repliesCount: true,
          hideLikes: true,
          privacy: true,
          ...getAuthorAndHiddenSelect(ctx.userId),
          ...GET_LIKES,
          ...GET_BOOKMARKS,
          ...GET_COUNT,
          ...GET_REPOSTS,
          ...GET_MENTIONS,
          ...GET_LINK_PREVIEW,
        },
      });

      if (!userProfileInfo) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      let nextCursor: typeof cursor | undefined;

      if (userProfileInfo.length > limit) {
        const nextItem = userProfileInfo.pop();
        if (nextItem != null) {
          nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
        }
      }

      return {
        replies: userProfileInfo.map((post) => ({
          id: post.id,
          createdAt: post.createdAt,
          text: post.text,
          media: post.media as PostMedia,
          parentPostId: post.parentPostId,
          parentPost: post.parentPost
            ? {
                ...post.parentPost,
                media: post.parentPost.media as PostMedia,
                likesCount: post.parentPost._count.likes,
                bookmarksCount: post.parentPost._count.bookmarks,
                repostsCount: post.parentPost._count.reposts,
                isMuted: post.parentPost.author.mutedByUsers.length > 0,
                isHidden: post.parentPost.hiddenBy.length > 0,
              }
            : null,
          author: post.author,
          likesCount: post._count.likes,
          likes: post.likes,
          reposts: post.reposts,
          repostsCount: post._count.reposts,
          bookmarks: post.bookmarks,
          bookmarksCount: post._count.bookmarks,
          mentions: post.mentions,
          quoteId: post.quoteId,
          hideLikes: post.hideLikes,
          path: post.path,
          repliesCount: post.repliesCount,
          linkPreview: post.linkPreview,
          privacy: post.privacy,
          isMuted: post.author.mutedByUsers.length > 0,
          isHidden: post.hiddenBy.length > 0,
        })),
        nextCursor,
      };
    }),

  repostsInfo: privateProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().optional(),
        cursor: z
          .object({ postId: z.string(), createdAt: z.date() })
          .optional(),
      })
    )
    .query(async ({ input: { username, limit = 20, cursor }, ctx }) => {
      const isUser = await ctx.db.user.findUnique({
        where: {
          username,
        },
      });

      if (!isUser) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const userReposts = await ctx.db.repost.findMany({
        where: {
          userId: isUser.id,
        },
        take: limit + 1,
        cursor: cursor
          ? {
              postId_userId: { postId: cursor.postId, userId: isUser.id },
              createdAt: cursor.createdAt,
            }
          : undefined,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          createdAt: true,
          userId: true,
          postId: true,
          user: {
            select: {
              ...GET_USER,
            },
          },
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
              hideLikes: true,
              privacy: true,
              ...getAuthorAndHiddenSelect(ctx.userId),
              ...GET_LIKES,
              ...GET_COUNT,
              ...GET_REPOSTS,
              ...GET_BOOKMARKS,
              ...GET_MENTIONS,
              ...GET_LINK_PREVIEW,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;

      if (userReposts.length > limit) {
        const nextItem = userReposts.pop();
        if (nextItem != null) {
          nextCursor = {
            postId: nextItem.postId,
            createdAt: nextItem.createdAt,
          };
        }
      }

      return {
        reposts: userReposts.map((repost) => ({
          id: repost.post.id,
          createdAt: repost.post.createdAt,
          text: repost.post.text,
          media: repost.post.media as PostMedia,
          parentPostId: repost.post.parentPostId,
          author: repost.post.author,
          likesCount: repost.post._count.likes,
          likes: repost.post.likes,
          reposts: repost.post.reposts,
          mentions: repost.post.mentions,
          bookmarks: repost.post.bookmarks,
          bookmarksCount: repost.post._count.bookmarks,
          quoteId: repost.post.quoteId,
          path: repost.post.path,
          repliesCount: repost.post.repliesCount,
          hideLikes: repost.post.hideLikes,
          repostsCount: repost.post._count.reposts,
          linkPreview: repost.post.linkPreview,
          repostedBy: repost.user,
          repostedAt: repost.createdAt,
          privacy: repost.post.privacy,
          isMuted: repost.post.author.mutedByUsers.length > 0,
          isHidden: repost.post.hiddenBy.length > 0,
        })),
        nextCursor,
      };
    }),

  toggleFollow: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId } = ctx;

      const isAlreadyFollowing = await ctx.db.user.findUnique({
        where: {
          id: userId,
        },
        select: {
          id: true,
          username: true,
          following: {
            where: {
              id: input.id,
            },
          },
        },
      });

      if (isAlreadyFollowing?.following.length === 0) {
        const transactionResult = await ctx.db.$transaction(async (prisma) => {
          const followUser = await prisma.user.update({
            where: { id: userId },
            data: {
              following: {
                connect: {
                  id: input.id,
                },
              },
            },
            select: {
              id: true,
              username: true,
            },
          });

          const createdNotification = await prisma.notification.create({
            data: {
              type: 'FOLLOW',
              senderUserId: userId,
              receiverUserId: input.id,
              message: `"Followed you"`,
            },
            select: {
              id: true,
            },
          });

          return {
            followUser,
            createdNotification,
          };
        });

        if (!transactionResult) {
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        }

        return { followUser: true };
      } else {
        const transactionResult = await ctx.db.$transaction(async (prisma) => {
          const unfollowUser = await prisma.user.update({
            where: { id: userId },
            data: {
              following: {
                disconnect: {
                  id: input.id,
                },
              },
            },
          });

          const notification = await prisma.notification.findFirst({
            where: {
              senderUserId: userId,
              receiverUserId: input.id,
              type: 'FOLLOW',
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
            unfollowUser,
          };
        });

        if (!transactionResult) {
          throw new TRPCError({ code: 'NOT_IMPLEMENTED' });
        }

        return { unFollowUser: false };
      }
    }),

  allUsers: privateProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { limit = 20, cursor, searchQuery }, ctx }) => {
      const allUsers = await ctx.db.user.findMany({
        where: searchQuery
          ? {
              OR: [
                { fullName: { contains: searchQuery, mode: 'insensitive' } },
                { username: { contains: searchQuery, mode: 'insensitive' } },
              ],
            }
          : undefined,
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: searchQuery
          ? [{ createdAt: 'desc' }, { id: 'desc' }]
          : [{ followers: { _count: 'desc' } }, { createdAt: 'desc' }],
        select: {
          ...GET_USER,
        },
      });

      let nextCursor: typeof cursor | undefined;

      if (allUsers.length > limit) {
        const nextItem = allUsers.pop();
        if (nextItem != null) {
          nextCursor = {
            id: nextItem.id,
            createdAt: nextItem.createdAt,
          };
        }
      }
      return {
        allUsers,
        nextCursor,
      };
    }),

  getMentionSuggestions: privateProcedure
    .input(
      z.object({
        searchQuery: z.string(),
      })
    )
    .query(async ({ input: { searchQuery }, ctx }) => {
      const allUsers = await ctx.db.user.findMany({
        where: {
          username: { contains: searchQuery },
        },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          username: true,
          fullName: true,
          image: true,
          followers: true,
          following: true,
        },
      });

      return allUsers;
    }),

  getUserFollowers: privateProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
        sortBy: z.enum(['latest', 'earliest']).optional().default('latest'),
      })
    )
    .query(async ({ input: { username, limit = 20, cursor, sortBy }, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const followers = await ctx.db.user.findMany({
        where: {
          following: {
            some: {
              id: user.id,
            },
          },
        },
        take: limit + 1,
        cursor: cursor
          ? { id: cursor.id, createdAt: cursor.createdAt }
          : undefined,
        orderBy: [{ createdAt: sortBy === 'latest' ? 'desc' : 'asc' }],
        select: {
          ...GET_USER,
        },
      });

      let nextCursor: typeof cursor | undefined;

      if (followers.length > limit) {
        const nextItem = followers.pop();
        if (nextItem != null) {
          nextCursor = {
            id: nextItem.id,
            createdAt: nextItem.createdAt,
          };
        }
      }

      return {
        followers,
        nextCursor,
      };
    }),

  getUserFollowing: privateProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
        sortBy: z.enum(['latest', 'earliest']).optional().default('latest'),
      })
    )
    .query(async ({ input: { username, limit = 20, cursor, sortBy }, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { username },
        select: { id: true },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const following = await ctx.db.user.findMany({
        where: {
          followers: {
            some: {
              id: user.id,
            },
          },
        },
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: sortBy === 'latest' ? 'desc' : 'asc' }],
        select: {
          ...GET_USER,
        },
      });

      let nextCursor: typeof cursor | undefined;

      if (following.length > limit) {
        const nextItem = following.pop();
        if (nextItem != null) {
          nextCursor = {
            id: nextItem.id,
            createdAt: nextItem.createdAt,
          };
        }
      }

      return {
        following,
        nextCursor,
      };
    }),

  toggleMuteUser: privateProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId: currentUserId } = ctx;

      if (currentUserId === input.userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot mute yourself',
        });
      }

      const data = {
        mutedUserId: input.userId,
        mutedByUserId: currentUserId,
      };

      const existingMute = await ctx.db.mutedUser.findUnique({
        where: {
          mutedUserId_mutedByUserId: data,
        },
      });

      if (existingMute == null) {
        await ctx.db.mutedUser.create({
          data,
        });
        return { muted: true };
      } else {
        await ctx.db.mutedUser.delete({
          where: {
            mutedUserId_mutedByUserId: data,
          },
        });
        return { muted: false };
      }
    }),
});
