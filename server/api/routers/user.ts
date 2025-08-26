import { PostMedia } from '@/lib/types';
import { getTotalRepliesCount, getUserEmail } from '@/lib/utils';
import {
  GET_LINK_PREVIEW,
  GET_MENTIONS,
  GET_REPOSTS,
  GET_USER,
  getAuthorAndHiddenSelect,
  getBookmarksWithBlockFilter,
  getLikesWithBlockFilter,
  getPostRepliesCount,
} from '@/server/constants';
import { clerkClient } from '@clerk/nextjs/server';
import { FollowRequestStatus, NotificationType, Privacy } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  userInfo: privateProcedure
    .input(
      z.object({
        username: z.string(),
        sortBy: z.enum(['LATEST', 'OLDEST']).optional(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { username, limit = 24, cursor, sortBy }, ctx }) => {
      const isUser = await ctx.db.user.findUnique({
        where: {
          username,
        },
      });
      if (!isUser) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const userProfileInfo = await ctx.db.user.findUnique({
        where: {
          username,
        },
        include: {
          followers: true,
          following: true,
          receivedFollowRequests: {
            where: {
              requesterId: ctx.userId,
              status: FollowRequestStatus.PENDING,
            },
          },
          blockedByUsers: {
            select: {
              blockingUserId: true,
            },
          },
          blockedUsers: {
            select: {
              blockedUserId: true,
            },
          },
          mutedByUsers: {
            select: {
              mutedByUserId: true,
            },
          },
          posts: {
            where: {
              parentPostId: null,
            },
            take: limit + 1,
            cursor: cursor ? { createdAt_id: cursor } : undefined,
            orderBy:
              sortBy === 'LATEST'
                ? [{ pinned: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]
                : [{ createdAt: 'asc' }, { id: 'asc' }],
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
              replies: true,
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
        },
      });

      if (!userProfileInfo) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      let nextCursor: typeof cursor | undefined;
      const posts = userProfileInfo.posts;

      if (posts.length > limit) {
        const nextItem = posts.pop();
        if (nextItem != null) {
          nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
        }
      }

      const totalLikes = posts.reduce(
        (sum, post) => sum + post.likes.length,
        0
      );

      const isMuted = userProfileInfo.mutedByUsers.some(
        (mutedUser) => mutedUser.mutedByUserId === ctx.userId
      );

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
          blockedByUsers: userProfileInfo.blockedByUsers,
          blockedUsers: userProfileInfo.blockedUsers,
          receivedFollowRequests: userProfileInfo.receivedFollowRequests,
          isMuted,
          posts: posts.map((post) => ({
            ...post,
            media: post.media as PostMedia[],
            likesCount: post.likes.length,
            repostsCount: post.reposts.length,
            repliesCount: post.replies.length,
            bookmarksCount: new Set(
              post.bookmarks.map((bookmark) => bookmark.userId)
            ).size,
            type: 'post' as const,
          })),
          totalLikes,
        },
        nextCursor,
      };
    }),

  getUserPosts: privateProcedure
    .input(
      z.object({
        username: z.string(),
        sortBy: z.enum(['LATEST', 'OLDEST']).optional().default('LATEST'),
      })
    )
    .query(async ({ input: { username, sortBy }, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          username,
        },
        select: {
          blockedUsers: {
            select: {
              blockedUserId: true,
            },
          },
          id: true,
          privacy: true,
          followers: { where: { id: ctx.userId } },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isPublic = user.privacy === Privacy.PUBLIC;
      const isOwnProfile = user.id === ctx.userId;
      const isFollowing = user.followers.length > 0;

      if (!isPublic && !isOwnProfile && !isFollowing) {
        return [];
      }

      const blockedUsers = user.blockedUsers.map(
        (blockedUser) => blockedUser.blockedUserId
      );

      const isBlocked = blockedUsers.includes(ctx.userId);

      if (isBlocked) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const posts = await ctx.db.post.findMany({
        where: {
          authorId: user.id,
          parentPostId: null,
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
          },
        },
        orderBy:
          sortBy === 'LATEST'
            ? [{ pinned: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }]
            : [{ createdAt: 'asc' }, { id: 'asc' }],
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
      });

      return posts.map((post) => ({
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
    }),

  getUserRepostsFeed: privateProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input: { username }, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { username },
        include: {
          blockedUsers: {
            select: {
              blockedUserId: true,
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const blockedUsers = user.blockedUsers.map(
        (blockedUser) => blockedUser.blockedUserId
      );

      const isBlocked = blockedUsers.includes(ctx.userId);

      if (isBlocked) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const reposts = await ctx.db.repost.findMany({
        where: {
          userId: user.id,
          post: {
            AND: [
              { parentPostId: null },
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
            ],
          },
        },
        orderBy: { createdAt: 'desc' },
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
              hideLikes: true,
              turnOffComments: true,
              pinned: true,
              privacy: true,
              author: {
                select: {
                  ...GET_USER,
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
      });

      const formattedReposts = reposts.map((repost) => ({
        ...repost.post,
        media: repost.post.media as PostMedia[],
        likesCount: repost.post.likes.length,
        repostsCount: repost.post.reposts.length,
        repliesCount: getTotalRepliesCount(repost.post) as number,
        bookmarksCount: new Set(
          repost.post.bookmarks.map((bookmark) => bookmark.userId)
        ).size,
        type: 'post' as const,
      }));

      return formattedReposts;
    }),

  getUserReposts: privateProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().optional(),
        cursor: z
          .object({
            postId: z.string(),
            userId: z.string(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { username, limit = 20, cursor }, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { username },
        select: {
          id: true,
          privacy: true,
          followers: { where: { id: ctx.userId } },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isPublic = user.privacy === Privacy.PUBLIC;
      const isOwnProfile = user.id === ctx.userId;
      const isFollowing = user.followers.length > 0;

      if (!isPublic && !isOwnProfile && !isFollowing) {
        return { posts: [], nextCursor: undefined };
      }

      const reposts = await ctx.db.repost.findMany({
        where: {
          userId: user.id,
          post: {
            AND: [
              { parentPostId: null },
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
            ],
          },
        },
        cursor: cursor
          ? { postId_userId: { postId: cursor.postId, userId: user.id } }
          : undefined,
        take: limit + 1,
        orderBy: { createdAt: 'desc' },
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
              hideLikes: true,
              turnOffComments: true,
              privacy: true,
              replies: true,
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
        },
      });

      const formattedReposts = reposts.map((repost) => ({
        ...repost.post,
        media: repost.post.media as PostMedia[],
        likesCount: repost.post.likes.length,
        repostsCount: repost.post.reposts.length,
        repliesCount: repost.post.replies.length,
        bookmarksCount: new Set(
          repost.post.bookmarks.map((bookmark) => bookmark.userId)
        ).size,
        type: 'post' as const,
      }));

      let nextCursor: typeof cursor | undefined;
      if (formattedReposts.length > limit) {
        const nextItem = formattedReposts[limit];
        nextCursor = {
          postId: nextItem.id,
          userId: user.id,
        };
        formattedReposts.length = limit;
      }

      return {
        posts: formattedReposts,
        nextCursor,
      };
    }),

  getUserLikedPostsFeed: privateProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input: { username }, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: { username },
        include: {
          blockedUsers: {
            select: {
              blockedUserId: true,
            },
          },
        },
      });
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const blockedUsers = user.blockedUsers.map(
        (blockedUser) => blockedUser.blockedUserId
      );

      const isBlocked = blockedUsers.includes(ctx.userId);

      if (isBlocked) {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }

      const likedPosts = await ctx.db.like.findMany({
        where: {
          userId: user.id,
          post: {
            AND: [
              { parentPostId: null },
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
            ],
          },
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
              hideLikes: true,
              turnOffComments: true,
              pinned: true,
              privacy: true,
              author: {
                select: {
                  ...GET_USER,
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
        orderBy: { createdAt: 'desc' },
      });

      return likedPosts.map((likedPost) => ({
        ...likedPost.post,
        media: likedPost.post.media as PostMedia[],
        likesCount: likedPost.post.likes.length,
        repostsCount: likedPost.post.reposts.length,
        repliesCount: getTotalRepliesCount(likedPost.post) as number,
        bookmarksCount: new Set(
          likedPost.post.bookmarks.map((bookmark) => bookmark.userId)
        ).size,
        type: 'post' as const,
      }));
    }),

  getUserLikedPosts: privateProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().optional(),
        cursor: z
          .object({
            postId: z.string(),
            userId: z.string(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { username, limit = 20, cursor }, ctx }) => {
      const user = await ctx.db.user.findUnique({
        where: {
          username,
        },
        select: {
          id: true,
          privacy: true,
          followers: { where: { id: ctx.userId } },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isPublic = user.privacy === Privacy.PUBLIC;
      const isOwnProfile = user.id === ctx.userId;
      const isFollowing = user.followers.length > 0;

      if (!isPublic && !isOwnProfile && !isFollowing) {
        return { posts: [], nextCursor: undefined };
      }

      const likedPosts = await ctx.db.like.findMany({
        where: {
          userId: user.id,
          post: {
            AND: [
              { parentPostId: null },
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
            ],
          },
        },
        take: limit + 1,
        cursor: cursor
          ? { postId_userId: { postId: cursor.postId, userId: user.id } }
          : undefined,
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
              hideLikes: true,
              turnOffComments: true,
              privacy: true,
              replies: true,
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
        },
        orderBy: { createdAt: 'desc' },
      });

      let nextCursor: typeof cursor | undefined;
      if (likedPosts.length > limit) {
        const nextItem = likedPosts[limit];
        nextCursor = {
          postId: nextItem.post.id,
          userId: user.id,
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
          type: 'post' as const,
        })),
        nextCursor,
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
      async ({ input: { username, filters, limit = 21, cursor }, ctx }) => {
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

        let whereCondition = {};

        if (filters.includes('ALL')) {
          whereCondition = {
            authorId: user.id,
            parentPostId: null,
            NOT: {
              reposts: {
                some: {
                  userId: user.id,
                },
              },
            },
          };
        } else {
          const conditions = [];

          if (filters.includes('TEXT')) {
            conditions.push({
              authorId: user.id,
              parentPostId: null,
            });
          }

          if (filters.includes('REPLIES')) {
            conditions.push({
              authorId: user.id,
              parentPostId: { not: null },
            });
          }

          if (filters.includes('REPOSTS')) {
            conditions.push({
              reposts: {
                some: { userId: user.id },
              },
            });
          }

          whereCondition = { OR: conditions };
        }

        const posts = await ctx.db.post.findMany({
          where: whereCondition,
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
            parentPost: {
              select: {
                id: true,
                createdAt: true,
                text: true,
                threadText: true,
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
                turnOffComments: true,
                pinned: true,
                privacy: true,
                replies: true,
                ...getAuthorAndHiddenSelect(ctx.userId),
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
            quoteId: true,
            path: true,
            hideLikes: true,
            turnOffComments: true,
            pinned: true,
            privacy: true,
            replies: true,
            ...getAuthorAndHiddenSelect(ctx.userId),
            ...getLikesWithBlockFilter(ctx.userId),
            ...getBookmarksWithBlockFilter(ctx.userId),
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
              (repost) => repost.user.id === user.id
            );
            return {
              id: post.id,
              createdAt: post.createdAt,
              text: post.text,
              threadText: post.threadText,
              parentPostId: post.parentPostId,
              parentPost: post.parentPost
                ? {
                    ...post.parentPost,
                    media: post.parentPost.media as PostMedia[],
                    likesCount: post.parentPost.likes.length,
                    repliesCount: post.parentPost.replies.length,
                    bookmarksCount: new Set(
                      post.parentPost.bookmarks.map(
                        (bookmark) => bookmark.userId
                      )
                    ).size,
                    repostsCount: post.parentPost.reposts.length,
                    isMuted: post.parentPost.author.mutedByUsers.length > 0,
                    isHidden: post.parentPost.hiddenBy.length > 0,
                  }
                : null,
              author: post.author,
              likesCount: post.likes.length,
              likes: post.likes,
              path: post.path,
              repliesCount: post.replies.length,
              hideLikes: post.hideLikes,
              turnOffComments: post.turnOffComments,
              pinned: post.pinned,
              quoteId: post.quoteId,
              media: post.media as PostMedia[],
              reposts: post.reposts,
              mentions: post.mentions,
              linkPreview: post.linkPreview,
              bookmarks: post.bookmarks,
              bookmarksCount: new Set(
                post.bookmarks.map((bookmark) => bookmark.userId)
              ).size,
              privacy: post.privacy,
              isHidden: post.hiddenBy.length > 0,
              isMuted: post.author.mutedByUsers.length > 0,
              repostsCount: post.reposts.length,
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
        // link: z
        //   .string()
        //   .optional()
        //   .refine(
        //     (value) => {
        //       return value === '' || z.string().url().safeParse(value).success;
        //     },
        //     {
        //       message: 'Invalid url',
        //     }
        //   ),
        bio: z.string().max(150).optional(),
        // privacy: z.enum(['PUBLIC', 'PRIVATE']),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      const { bio, image } = input;
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
          bio,
        },
      });

      if (image && image !== dbUser.image) {
        try {
          const imageResponse = await fetch(image);
          const imageBlob = await imageResponse.blob();

          await clerkClient.users.updateUserProfileImage(dbUser.id, {
            file: imageBlob,
          });
        } catch (error) {
          console.error('Failed to update Clerk profile image:', error);
        }
      }

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
          threadText: true,
          media: true,
          parentPostId: true,
          parentPost: {
            select: {
              id: true,
              createdAt: true,
              text: true,
              threadText: true,
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
              turnOffComments: true,
              pinned: true,
              privacy: true,
              replies: true,
              ...getAuthorAndHiddenSelect(ctx.userId),
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
          quoteId: true,
          path: true,
          repliesCount: true,
          hideLikes: true,
          turnOffComments: true,
          pinned: true,
          privacy: true,
          ...getAuthorAndHiddenSelect(ctx.userId),
          ...getLikesWithBlockFilter(ctx.userId),
          ...getBookmarksWithBlockFilter(ctx.userId),
          replies: true,
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
          threadText: post.threadText,
          media: post.media as PostMedia[],
          parentPostId: post.parentPostId,
          parentPost: post.parentPost
            ? {
                ...post.parentPost,
                media: post.parentPost.media as PostMedia[],
                likesCount: post.parentPost.likes.length,
                bookmarksCount: new Set(
                  post.parentPost.bookmarks.map((bookmark) => bookmark.userId)
                ).size,
                repostsCount: post.parentPost.reposts.length,
                isMuted: post.parentPost.author.mutedByUsers.length > 0,
                isHidden: post.parentPost.hiddenBy.length > 0,
              }
            : null,
          author: post.author,
          likesCount: post.likes.length,
          likes: post.likes,
          reposts: post.reposts,
          repostsCount: post.reposts.length,
          bookmarks: post.bookmarks,
          bookmarksCount: new Set(
            post.bookmarks.map((bookmark) => bookmark.userId)
          ).size,
          mentions: post.mentions,
          quoteId: post.quoteId,
          hideLikes: post.hideLikes,
          turnOffComments: post.turnOffComments,
          pinned: post.pinned,
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
              threadText: true,
              media: true,
              parentPostId: true,
              quoteId: true,
              path: true,
              repliesCount: true,
              hideLikes: true,
              turnOffComments: true,
              pinned: true,
              privacy: true,
              ...getAuthorAndHiddenSelect(ctx.userId),
              ...getLikesWithBlockFilter(ctx.userId),
              replies: true,
              reposts: {
                ...GET_REPOSTS,
                orderBy: {
                  createdAt: 'desc',
                },
              },
              ...getBookmarksWithBlockFilter(ctx.userId),
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
          threadText: repost.post.threadText,
          media: repost.post.media as PostMedia[],
          parentPostId: repost.post.parentPostId,
          author: repost.post.author,
          likesCount: repost.post.likes.length,
          likes: repost.post.likes,
          reposts: repost.post.reposts,
          mentions: repost.post.mentions,
          bookmarks: repost.post.bookmarks,
          bookmarksCount: new Set(
            repost.post.bookmarks.map((bookmark) => bookmark.userId)
          ).size,
          quoteId: repost.post.quoteId,
          path: repost.post.path,
          repliesCount: repost.post.repliesCount,
          hideLikes: repost.post.hideLikes,
          turnOffComments: repost.post.turnOffComments,
          pinned: repost.post.pinned,
          repostsCount: repost.post.reposts.length,
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
      const { id: targetUserId } = input;

      if (userId === targetUserId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot follow yourself.',
        });
      }

      const targetUser = await ctx.db.user.findUnique({
        where: { id: targetUserId },
        select: { privacy: true },
      });

      if (!targetUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
      }

      const isFollowing = await ctx.db.user.findFirst({
        where: { id: userId, following: { some: { id: targetUserId } } },
      });

      if (isFollowing) {
        await ctx.db.user.update({
          where: { id: userId },
          data: { following: { disconnect: { id: targetUserId } } },
        });
        return { status: 'NOT_FOLLOWING' };
      }

      const existingRequest = await ctx.db.followRequest.findUnique({
        where: {
          requesterId_receiverId: {
            requesterId: userId,
            receiverId: targetUserId,
          },
        },
      });

      if (existingRequest?.status === 'PENDING') {
        await ctx.db.followRequest.delete({
          where: { id: existingRequest.id },
        });
        return { status: 'NOT_FOLLOWING' };
      }

      if (targetUser.privacy === Privacy.PUBLIC) {
        await ctx.db.$transaction(async (prisma) => {
          await prisma.user.update({
            where: { id: userId },
            data: { following: { connect: { id: targetUserId } } },
          });
          await prisma.notification.create({
            data: {
              type: NotificationType.FOLLOWER,
              senderUserId: userId,
              receiverUserId: targetUserId,
              message: 'started following you',
            },
          });
        });
        return { status: 'FOLLOWING' };
      } else {
        await ctx.db.$transaction(async (prisma) => {
          await prisma.followRequest.create({
            data: {
              requesterId: userId,
              receiverId: targetUserId,
            },
          });

          await prisma.notification.create({
            data: {
              type: NotificationType.FOLLOW_REQUEST,
              senderUserId: userId,
              receiverUserId: targetUserId,
              message: 'requested to follow you.',
            },
          });
        });

        return { status: 'REQUESTED' };
      }
    }),

  searchUsers: privateProcedure
    .input(
      z.object({
        searchQuery: z.string().optional(),
      })
    )
    .query(async ({ input: { searchQuery }, ctx }) => {
      if (!searchQuery || searchQuery.trim() === '') {
        return [];
      }

      const allUsers = await ctx.db.user.findMany({
        where: {
          AND: [
            {
              OR: [
                {
                  username: {
                    contains: searchQuery,
                    mode: 'insensitive',
                  },
                },
                {
                  fullName: {
                    contains: searchQuery,
                    mode: 'insensitive',
                  },
                },
              ],
            },
            { id: { not: ctx.userId } },
          ],
        },
        take: 10,
        orderBy: [{ followers: { _count: 'desc' } }],
        select: {
          ...GET_USER,
          _count: {
            select: {
              followers: true,
            },
          },
        },
      });

      return allUsers.map((user) => {
        const { _count, ...userData } = user;
        return userData;
      });
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
        select: {
          id: true,
          privacy: true,
          followers: { where: { id: ctx.userId } },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isPublic = user.privacy === Privacy.PUBLIC;
      const isOwnProfile = user.id === ctx.userId;
      const isFollowing = user.followers.length > 0;

      if (!isPublic && !isOwnProfile && !isFollowing) {
        return { followers: [], nextCursor: undefined };
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
        select: {
          id: true,
          privacy: true,
          followers: { where: { id: ctx.userId } },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isPublic = user.privacy === Privacy.PUBLIC;
      const isOwnProfile = user.id === ctx.userId;
      const isFollowing = user.followers.length > 0;

      if (!isPublic && !isOwnProfile && !isFollowing) {
        return { following: [], nextCursor: undefined };
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

  toggleBlockUser: privateProcedure
    .input(
      z.object({
        targetUserId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const { targetUserId } = input;

      if (userId === targetUserId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot block yourself',
        });
      }

      try {
        const existingBlock = await ctx.db.blockedUser.findUnique({
          where: {
            blockedUserId_blockingUserId: {
              blockedUserId: targetUserId,
              blockingUserId: userId,
            },
          },
        });

        if (existingBlock) {
          await ctx.db.blockedUser.delete({
            where: {
              blockedUserId_blockingUserId: {
                blockedUserId: targetUserId,
                blockingUserId: userId,
              },
            },
          });

          return {
            blocked: false,
            message: 'User unblocked successfully',
          };
        }

        return await ctx.db.$transaction(async (prisma) => {
          await prisma.blockedUser.create({
            data: {
              blockingUserId: userId,
              blockedUserId: targetUserId,
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: {
              following: {
                disconnect: { id: targetUserId },
              },
            },
          });

          await prisma.user.update({
            where: { id: targetUserId },
            data: {
              following: {
                disconnect: { id: userId },
              },
            },
          });

          return {
            blocked: true,
            message: 'User blocked successfully',
          };
        });
      } catch (error) {
        console.error('Error in toggleBlockUser:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to toggle block status',
        });
      }
    }),

  setPrivacy: privateProcedure
    .input(
      z.object({
        isPrivate: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId } = ctx;
      const newPrivacyStatus = input.isPrivate
        ? Privacy.PRIVATE
        : Privacy.PUBLIC;

      if (newPrivacyStatus === Privacy.PUBLIC) {
        await ctx.db.$transaction(async (prisma) => {
          const pendingRequests = await prisma.followRequest.findMany({
            where: {
              receiverId: userId,
              status: FollowRequestStatus.PENDING,
            },
            select: {
              requesterId: true,
            },
          });

          if (pendingRequests.length > 0) {
            const requesterIds = pendingRequests.map((req) => ({
              id: req.requesterId,
            }));

            await prisma.user.update({
              where: { id: userId },
              data: {
                privacy: newPrivacyStatus,
                followers: {
                  connect: requesterIds,
                },
              },
            });

            await prisma.notification.createMany({
              data: pendingRequests.map((req) => ({
                type: NotificationType.FOLLOWER,
                senderUserId: req.requesterId,
                receiverUserId: userId,
                message: 'started following you',
              })),
            });

            await prisma.followRequest.deleteMany({
              where: {
                receiverId: userId,
                status: FollowRequestStatus.PENDING,
              },
            });
          } else {
            await prisma.user.update({
              where: { id: userId },
              data: { privacy: newPrivacyStatus },
            });
          }
        });
      } else {
        await ctx.db.user.update({
          where: { id: userId },
          data: { privacy: newPrivacyStatus },
        });
      }

      return { success: true, privacy: newPrivacyStatus };
    }),

  getMe: privateProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: {
        id: ctx.userId,
      },
      select: {
        ...GET_USER,
        blockedUsers: true,
        mutedUsers: true,
      },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
    }

    return user;
  }),

  getBlockedUsers: privateProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z
          .object({
            blockedUserId: z.string(),
            blockingUserId: z.string(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const blockedUsers = await ctx.db.blockedUser.findMany({
        where: {
          blockingUserId: ctx.userId,
        },
        cursor: cursor
          ? {
              blockedUserId_blockingUserId: {
                blockedUserId: cursor.blockedUserId,
                blockingUserId: ctx.userId,
              },
            }
          : undefined,
        take: limit + 1,
        orderBy: { createdAt: 'desc' },
        include: {
          blockedUser: {
            select: {
              id: true,
              image: true,
              username: true,
              fullName: true,
              bio: true,
              followers: {
                select: { id: true },
              },
            },
          },
        },
      });

      const formattedBlockedUsers = blockedUsers.map((user) => ({
        id: user.blockedUser.id,
        image: user.blockedUser.image,
        username: user.blockedUser.username,
        fullName: user.blockedUser.fullName,
        bio: user.blockedUser.bio,
        followersCount: user.blockedUser.followers.length,
      }));

      let nextCursor: typeof cursor | undefined;
      if (formattedBlockedUsers.length > limit) {
        const nextItem = formattedBlockedUsers[limit];
        nextCursor = {
          blockedUserId: nextItem.id,
          blockingUserId: ctx.userId,
        };
        formattedBlockedUsers.length = limit;
      }

      return {
        blockedUsers: formattedBlockedUsers,
        nextCursor,
      };
    }),

  getMutedUsers: privateProcedure
    .input(
      z.object({
        limit: z.number().optional(),
        cursor: z
          .object({
            mutedUserId: z.string(),
            mutedByUserId: z.string(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 20, cursor }, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const mutedUsers = await ctx.db.mutedUser.findMany({
        where: {
          mutedByUserId: ctx.userId,
        },
        cursor: cursor
          ? {
              mutedUserId_mutedByUserId: {
                mutedUserId: cursor.mutedUserId,
                mutedByUserId: ctx.userId,
              },
            }
          : undefined,
        take: limit + 1,
        orderBy: { createdAt: 'desc' },
        include: {
          mutedUser: {
            select: {
              id: true,
              image: true,
              username: true,
              fullName: true,
              bio: true,
              followers: {
                select: { id: true },
              },
            },
          },
        },
      });

      const formattedMutedUsers = mutedUsers.map((user) => ({
        id: user.mutedUser.id,
        image: user.mutedUser.image,
        username: user.mutedUser.username,
        fullName: user.mutedUser.fullName,
        bio: user.mutedUser.bio,
        followersCount: user.mutedUser.followers.length,
      }));

      let nextCursor: typeof cursor | undefined;
      if (formattedMutedUsers.length > limit) {
        const nextItem = formattedMutedUsers[limit];
        nextCursor = {
          mutedUserId: nextItem.id,
          mutedByUserId: ctx.userId,
        };
        formattedMutedUsers.length = limit;
      }

      return {
        mutedUsers: formattedMutedUsers,
        nextCursor,
      };
    }),
});
