import { getUserEmail } from '@/lib/utils';
import {
  GET_COUNT,
  GET_LIKES,
  GET_REPOSTS,
  GET_USER,
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
        },
      };
    }),

  postInfo: privateProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { username, limit = 10, cursor }, ctx }) => {
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
          authorId: isUser.id,
          parentPostId: null,
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
          ...GET_COUNT,
          ...GET_REPOSTS,
          _count: {
            select: {
              likes: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;

      if (userProfileInfo.length > limit) {
        const nextItem = userProfileInfo.pop();
        if (nextItem != null) {
          nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
        }
      }

      return {
        posts: userProfileInfo.map((post) => ({
          id: post.id,
          createdAt: post.createdAt,
          text: post.text,
          parentPostId: post.parentPostId,
          author: post.author,
          likesCount: post._count.likes,
          likes: post.likes,
          path: post.path,
          repliesCount: post.repliesCount,
          quoteId: post.quoteId,
          images: post.images,
          reposts: post.reposts,
        })),
        nextCursor,
      };
    }),

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
    .query(async ({ input: { username, limit = 10, cursor }, ctx }) => {
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
          ...GET_COUNT,
          ...GET_REPOSTS,
          _count: {
            select: {
              likes: true,
            },
          },
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
          images: post.images,
          parentPostId: post.parentPostId,
          author: post.author,
          likesCount: post._count.likes,
          likes: post.likes,
          reposts: post.reposts,
          quoteId: post.quoteId,
          path: post.path,
          repliesCount: post.repliesCount,
        })),
        nextCursor,
      };
    }),

  repostsInfo: privateProcedure
    .input(
      z.object({
        username: z.string(),
        limit: z.number().optional(),
        cursor: z.object({ id: z.string(), createdAt: z.date() }).optional(),
      })
    )
    .query(async ({ input: { username, limit = 10, cursor }, ctx }) => {
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
          reposts: {
            some: {
              userId: isUser.id,
            },
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
          ...GET_COUNT,
          ...GET_REPOSTS,
          _count: {
            select: {
              likes: true,
              reposts: true,
            },
          },
          reposts: {
            select: {
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

      let nextCursor: typeof cursor | undefined;

      if (userProfileInfo.length > limit) {
        const nextItem = userProfileInfo.pop();
        if (nextItem != null) {
          nextCursor = { id: nextItem.id, createdAt: nextItem.createdAt };
        }
      }

      return {
        reposts: userProfileInfo.map((post) => ({
          id: post.id,
          createdAt: post.createdAt,
          text: post.text,
          images: post.images,
          parentPostId: post.parentPostId,
          author: post.author,
          likesCount: post._count.likes,
          likes: post.likes,
          reposts: post.reposts.map((repost) => ({
            userId: repost.user.id,
            postId: repost.post.id,
          })),
          quoteId: post.quoteId,
          path: post.path,
          repliesCount: post.repliesCount,
          repostsCount: post._count.reposts,
          repostedBy: post.reposts[0].user,
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
});
