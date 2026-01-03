import {
  enrichPostWithTokens,
  getTotalRepliesCount,
  getUserEmail,
} from '@/lib/utils';
import {
  GET_MENTIONS,
  GET_REPOSTS,
  GET_USER,
  getBookmarksWithBlockFilter,
  getLikesWithBlockFilter,
  getPostReplies,
} from '@/server/constants';
import { clerkClient } from '@clerk/nextjs/server';
import {
  FollowRequestStatus,
  NotificationType,
  PostStatus,
  Privacy,
} from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  getUserProfile: privateProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input: { username }, ctx }) => {
      const { userId, db } = ctx;

      const userProfile = await db.user.findUnique({
        where: { username, deactivated: false },
        include: {
          _count: {
            select: { followers: true, following: true },
          },
          followers: true,
          following: true,
          receivedFollowRequests: {
            where: {
              requesterId: userId,
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
              status: PostStatus.VISIBLE,
            },
            select: {
              likes: { select: { userId: true } },
            },
          },
        },
      });

      if (!userProfile) throw new TRPCError({ code: 'NOT_FOUND' });

      const totalLikes = userProfile.posts.reduce(
        (acc, post) => acc + post.likes.length,
        0
      );

      const isMuted = userProfile.mutedByUsers.some(
        (mutedUser) => mutedUser.mutedByUserId === userId
      );

      const isBlockedByMe = userProfile.blockedByUsers.some(
        (blockedUser) => blockedUser.blockingUserId === userId
      );

      const hasBlockedMe = userProfile.blockedUsers.some(
        (blockedUser) => blockedUser.blockedUserId === userId
      );

      const isFollower = userProfile.followers.some(
        (follower) => follower.followerId === userId
      );

      return {
        id: userProfile.id,
        image: userProfile.image,
        fullName: userProfile.fullName,
        username: userProfile.username,
        bio: userProfile.bio,
        link: userProfile.link,
        privacy: userProfile.privacy,
        createdAt: userProfile.createdAt,
        isAdmin: userProfile.isAdmin,
        followers: userProfile.followers,
        following: userProfile.following,
        receivedFollowRequests: userProfile.receivedFollowRequests,
        isBlockedByMe,
        hasBlockedMe,
        isFollower,
        totalLikes,
        isMuted,
      };
    }),

  getUserPosts: privateProcedure
    .input(
      z.object({
        username: z.string(),
        sortBy: z.enum(['LATEST', 'OLDEST']).optional(),
        limit: z.number().min(1).max(100).default(18),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input, ctx }) => {
      const { username, limit, cursor, sortBy } = input;
      const { userId, db } = ctx;

      const userWithPosts = await db.user.findUnique({
        where: { username },
        select: {
          posts: {
            where: {
              parentPostId: null,
              status: PostStatus.VISIBLE,
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
              ...getPostReplies(userId),
              ...GET_MENTIONS,
              reposts: {
                ...GET_REPOSTS,
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
      });

      if (!userWithPosts) throw new TRPCError({ code: 'NOT_FOUND' });

      let nextCursor: typeof cursor | undefined;
      const rawPosts = userWithPosts.posts;

      if (rawPosts.length > limit) {
        const nextItem = rawPosts.pop();
        if (nextItem) {
          nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
        }
      }

      const formattedPosts = await Promise.all(
        rawPosts.map(async (post) => {
          const postWithTokens = await enrichPostWithTokens(post);
          return {
            ...postWithTokens,
            likesCount: post.likes.length,
            repostsCount: post.reposts.length,
            repliesCount: getTotalRepliesCount(post) as number,
            bookmarksCount: new Set(post.bookmarks.map((b) => b.userId)).size,
          };
        })
      );

      return {
        posts: formattedPosts,
        nextCursor,
      };
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
    .query(async ({ input: { username, limit = 18, cursor }, ctx }) => {
      if (!username) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Username is required',
        });
      }
      const { userId, db } = ctx;
      const user = await db.user.findUnique({
        where: { username, deactivated: false },
        select: {
          id: true,
          privacy: true,
          followers: { where: { followerId: userId } },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isPublic = user.privacy === Privacy.PUBLIC;
      const isOwnProfile = user.id === userId;
      const isFollowing = user.followers.length > 0;

      if (!isPublic && !isOwnProfile && !isFollowing) {
        return { posts: [], nextCursor: undefined };
      }

      const reposts = await db.repost.findMany({
        where: {
          userId: user.id,
          post: {
            AND: [
              { parentPostId: null },
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
              ...getLikesWithBlockFilter(userId),
              ...getBookmarksWithBlockFilter(userId),
              reposts: {
                ...GET_REPOSTS,
                orderBy: {
                  createdAt: 'desc',
                },
              },
              ...GET_MENTIONS,
            },
          },
        },
      });

      const formattedReposts = await Promise.all(
        reposts.map(async (repost) => {
          const postWithTokens = await enrichPostWithTokens(repost.post);
          return {
            ...postWithTokens,
            likesCount: repost.post.likes.length,
            repostsCount: repost.post.reposts.length,
            repliesCount: repost.post.replies.length,
            bookmarksCount: new Set(
              repost.post.bookmarks.map((bookmark) => bookmark.userId)
            ).size,
          };
        })
      );

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
    .query(async ({ input: { username, limit = 18, cursor }, ctx }) => {
      if (!username) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Username is required',
        });
      }
      const { userId, db } = ctx;
      const user = await db.user.findUnique({
        where: {
          username,
          deactivated: false,
        },
        select: {
          id: true,
          privacy: true,
          followers: { where: { followerId: userId } },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isPublic = user.privacy === Privacy.PUBLIC;
      const isOwnProfile = user.id === userId;
      const isFollowing = user.followers.length > 0;

      if (!isPublic && !isOwnProfile && !isFollowing) {
        return { posts: [], nextCursor: undefined };
      }

      const likedPosts = await db.like.findMany({
        where: {
          userId: user.id,
          post: {
            AND: [
              { parentPostId: null },
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
              media: true,
              parentPostId: true,
              quoteId: true,
              path: true,
              hideLikes: true,
              turnOffComments: true,
              privacy: true,
              author: {
                select: {
                  ...GET_USER,
                },
              },
              ...getLikesWithBlockFilter(userId),
              ...getBookmarksWithBlockFilter(userId),
              ...getPostReplies(userId),
              reposts: {
                ...GET_REPOSTS,
                orderBy: {
                  createdAt: 'desc',
                },
              },
              ...GET_MENTIONS,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      const formattedLikedPosts = await Promise.all(
        likedPosts.map(async (likedPost) => {
          const postWithTokens = await enrichPostWithTokens(likedPost.post);

          return {
            ...postWithTokens,
            likesCount: likedPost.post.likes.length,
            repostsCount: likedPost.post.reposts.length,
            repliesCount: getTotalRepliesCount(likedPost.post) as number,
            bookmarksCount: new Set(
              likedPost.post.bookmarks.map((bookmark) => bookmark.userId)
            ).size,
          };
        })
      );

      let nextCursor: typeof cursor | undefined;
      if (formattedLikedPosts.length > limit) {
        const nextItem = formattedLikedPosts[limit];
        nextCursor = {
          postId: nextItem.id,
          userId: user.id,
        };
        formattedLikedPosts.length = limit;
      }
      return {
        posts: formattedLikedPosts,
        nextCursor,
      };
    }),

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
      const { user, db } = ctx;
      const { bio, image } = input;
      const email = getUserEmail(user);
      const dbUser = await db.user.findUnique({
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

      const updatedUser = await db.user.update({
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

          const client = await clerkClient();

          await client.users.updateUserProfileImage(dbUser.id, {
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

  toggleFollow: privateProcedure
    .input(
      z.object({
        id: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const { userId, db } = ctx;
      const { id: targetUserId } = input;

      if (userId === targetUserId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot follow yourself.',
        });
      }

      const targetUser = await db.user.findUnique({
        where: { id: targetUserId },
        select: { privacy: true },
      });

      if (!targetUser) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
      }

      const existingFollow = await db.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetUserId,
          },
        },
      });

      if (existingFollow) {
        await db.follow.delete({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: targetUserId,
            },
          },
        });
        return { status: 'NOT_FOLLOWING' };
      }

      const existingRequest = await db.followRequest.findUnique({
        where: {
          requesterId_receiverId: {
            requesterId: userId,
            receiverId: targetUserId,
          },
        },
      });

      if (existingRequest?.status === 'PENDING') {
        await db.followRequest.delete({
          where: { id: existingRequest.id },
        });
        return { status: 'NOT_FOLLOWING' };
      }

      if (targetUser.privacy === Privacy.PUBLIC) {
        await db.$transaction(async (prisma) => {
          await prisma.follow.create({
            data: {
              followerId: userId,
              followingId: targetUserId,
            },
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
        await db.$transaction(async (prisma) => {
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
      const { userId, db } = ctx;

      const allUsers = await db.user.findMany({
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
            { id: { not: userId } },
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
      const { db } = ctx;
      const allUsers = await db.user.findMany({
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
      const { db } = ctx;
      const allUsers = await db.user.findMany({
        where: {
          username: { contains: searchQuery },
          deactivated: false,
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
      const { userId, db } = ctx;
      const user = await db.user.findUnique({
        where: { username },
        select: {
          id: true,
          privacy: true,
          followers: { where: { followerId: userId } },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isPublic = user.privacy === Privacy.PUBLIC;
      const isOwnProfile = user.id === userId;
      const isFollowing = user.followers.length > 0;

      if (!isPublic && !isOwnProfile && !isFollowing) {
        return { followers: [], nextCursor: undefined };
      }

      const followRecords = await db.follow.findMany({
        where: { followingId: user.id },
        take: limit + 1,
        cursor: cursor
          ? {
              followerId_followingId: {
                followerId: cursor.id,
                followingId: user.id,
              },
            }
          : undefined,
        orderBy: [{ createdAt: sortBy === 'latest' ? 'desc' : 'asc' }],
        select: {
          createdAt: true,
          follower: {
            select: { ...GET_USER },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;
      const followers = followRecords.map((f) => f.follower);

      if (followers.length > limit) {
        const nextItem = followRecords.pop();
        if (nextItem) {
          nextCursor = {
            id: nextItem.follower.id,
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
      const { userId, db } = ctx;
      const user = await db.user.findUnique({
        where: { username },
        select: {
          id: true,
          privacy: true,
          followers: { where: { followerId: userId } },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const isPublic = user.privacy === Privacy.PUBLIC;
      const isOwnProfile = user.id === userId;
      const isFollowing = user.followers.length > 0;

      if (!isPublic && !isOwnProfile && !isFollowing) {
        return { following: [], nextCursor: undefined };
      }

      const followingRecords = await db.follow.findMany({
        where: { followerId: user.id },
        take: limit + 1,
        cursor: cursor
          ? {
              followerId_followingId: {
                followerId: user.id,
                followingId: cursor.id,
              },
            }
          : undefined,
        orderBy: [{ createdAt: sortBy === 'latest' ? 'desc' : 'asc' }],
        select: {
          createdAt: true,
          following: {
            select: { ...GET_USER },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;
      const following = followingRecords.map((f) => f.following);

      if (following.length > limit) {
        const nextItem = followingRecords.pop();
        if (nextItem) {
          nextCursor = {
            id: nextItem.following.id,
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
      const { userId: currentUserId, db } = ctx;

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

      const existingMute = await db.mutedUser.findUnique({
        where: {
          mutedUserId_mutedByUserId: data,
        },
      });

      if (existingMute == null) {
        await db.mutedUser.create({
          data,
        });
        return { muted: true };
      } else {
        await db.mutedUser.delete({
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
      const { userId, db } = ctx;
      const { targetUserId } = input;

      if (userId === targetUserId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot block yourself',
        });
      }

      try {
        const existingBlock = await db.blockedUser.findUnique({
          where: {
            blockedUserId_blockingUserId: {
              blockedUserId: targetUserId,
              blockingUserId: userId,
            },
          },
        });

        if (existingBlock) {
          await db.blockedUser.delete({
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

        return await db.$transaction(async (prisma) => {
          await prisma.blockedUser.create({
            data: {
              blockingUserId: userId,
              blockedUserId: targetUserId,
            },
          });

          await prisma.follow.deleteMany({
            where: {
              OR: [
                { followerId: userId, followingId: targetUserId },
                { followerId: targetUserId, followingId: userId },
              ],
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
      const { userId, db } = ctx;
      const newPrivacyStatus = input.isPrivate
        ? Privacy.PRIVATE
        : Privacy.PUBLIC;

      if (newPrivacyStatus === Privacy.PUBLIC) {
        await db.$transaction(async (prisma) => {
          const pendingRequests = await prisma.followRequest.findMany({
            where: {
              receiverId: userId,
              status: FollowRequestStatus.PENDING,
            },
            select: {
              requesterId: true,
            },
          });

          await prisma.user.update({
            where: { id: userId },
            data: { privacy: newPrivacyStatus },
          });

          if (pendingRequests.length > 0) {
            await prisma.follow.createMany({
              data: pendingRequests.map((req) => ({
                followerId: req.requesterId,
                followingId: userId,
              })),
              skipDuplicates: true,
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
        await db.user.update({
          where: { id: userId },
          data: { privacy: newPrivacyStatus },
        });
      }

      return { success: true, privacy: newPrivacyStatus };
    }),

  getMe: privateProcedure.query(async ({ ctx }) => {
    const { userId, db } = ctx;

    const user = await db.user.findUnique({
      where: {
        id: userId,
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
      const { userId, db } = ctx;

      if (!userId) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const blockedUsers = await db.blockedUser.findMany({
        where: {
          blockingUserId: userId,
        },
        cursor: cursor
          ? {
              blockedUserId_blockingUserId: {
                blockedUserId: cursor.blockedUserId,
                blockingUserId: userId,
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
                select: { followerId: true },
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
          blockingUserId: userId,
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
      const { userId, db } = ctx;

      if (!userId) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }

      const mutedUsers = await db.mutedUser.findMany({
        where: {
          mutedByUserId: userId,
        },
        cursor: cursor
          ? {
              mutedUserId_mutedByUserId: {
                mutedUserId: cursor.mutedUserId,
                mutedByUserId: userId,
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
                select: { followerId: true },
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
          mutedByUserId: userId,
        };
        formattedMutedUsers.length = limit;
      }

      return {
        mutedUsers: formattedMutedUsers,
        nextCursor,
      };
    }),
  reactivateAccount: privateProcedure.mutation(async ({ ctx }) => {
    const { userId, db } = ctx;
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { deactivated: true },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    if (!user?.deactivated) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: 'Account is not deactivated',
      });
    }

    await db.user.update({
      where: { id: userId },
      data: {
        deactivated: false,
        deactivatedAt: null,
      },
    });

    return { success: true };
  }),
});
