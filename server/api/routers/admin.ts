import { inngest } from '@/inngest/client';
import { PostMedia } from '@/lib/types';
import { getChartDataTemplate, getTotalRepliesCount } from '@/lib/utils';
import { GET_USER, getPostRepliesCount } from '@/server/constants';
import { clerkClient } from '@clerk/nextjs/server';
import { PostStatus, Prisma, Role, UserStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import axios from 'axios';
import { z } from 'zod';
import { adminProcedure, createTRPCRouter } from '../trpc';

const getActiveUsersFromClerk = async (since: Date): Promise<number> => {
  const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
  if (!CLERK_SECRET_KEY) {
    console.error('CLERK_SECRET_KEY is not set in environment variables.');
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Server configuration error: Clerk secret key is missing.',
    });
  }

  const url = `https://api.clerk.com/v1/users/count?last_active_at_after=${since.getTime()}`;

  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET_KEY}`,
      },
    });
    return response.data.total_count;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(
        `Clerk API error (Axios): ${error.response?.data || error.message}`
      );
    } else {
      console.error(`An unexpected error occurred: ${error}`);
    }
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Failed to fetch active users count from Clerk.',
    });
  }
};

export const adminRouter = createTRPCRouter({
  setRole: adminProcedure
    .input(z.object({ targetUserId: z.string(), role: z.nativeEnum(Role) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.user.update({
        where: { id: input.targetUserId },
        data: { role: input.role },
      });

      await clerkClient.users.updateUserMetadata(input.targetUserId, {
        publicMetadata: {
          role: input.role,
        },
      });

      return { success: true };
    }),

  deletePost: adminProcedure
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

  togglePostStatus: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const post = await ctx.db.post.findUnique({
        where: { id: input.id },
        select: { status: true },
      });

      if (!post) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Post not found.' });
      }

      const newStatus =
        post.status === PostStatus.VISIBLE
          ? PostStatus.HIDDEN
          : PostStatus.VISIBLE;

      await ctx.db.post.update({
        where: { id: input.id },
        data: { status: newStatus },
      });

      return { success: true, newStatus };
    }),

  getDashboardAnalytics: adminProcedure.query(async ({ ctx }) => {
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const [
        totalUsers,
        totalPosts,
        newUsersCount,
        activeUsersCount,
        newUsersInLast6Months,
        postsInLast6Months,
      ] = await Promise.all([
        ctx.db.user.count({ where: { verified: true } }),
        ctx.db.post.count({ where: { parentPostId: null } }),
        ctx.db.user.count({
          where: { createdAt: { gte: twentyFourHoursAgo } },
        }),
        getActiveUsersFromClerk(twentyFourHoursAgo),
        ctx.db.user.findMany({
          where: { createdAt: { gte: sixMonthsAgo } },
          select: { createdAt: true },
        }),
        ctx.db.post.findMany({
          where: { createdAt: { gte: sixMonthsAgo } },
          select: { createdAt: true },
        }),
      ]);

      const daysInSixMonths = Math.round(
        (new Date().getTime() - sixMonthsAgo.getTime()) / (1000 * 3600 * 24)
      );

      const usersChartData = getChartDataTemplate(daysInSixMonths);
      newUsersInLast6Months.forEach((user) => {
        const dateStr = user.createdAt.toISOString().split('T')[0];
        const dayData = usersChartData.find((d) => d.date === dateStr);
        if (dayData) {
          dayData.value++;
        }
      });

      const postsChartData = getChartDataTemplate(daysInSixMonths);
      postsInLast6Months.forEach((post) => {
        const dateStr = post.createdAt.toISOString().split('T')[0];
        const dayData = postsChartData.find((d) => d.date === dateStr);
        if (dayData) {
          dayData.value++;
        }
      });

      return {
        totalUsers,
        totalPosts,
        newUsers24h: newUsersCount,
        activeUsers24h: activeUsersCount,
        usersChartData,
        postsChartData,
      };
    } catch (error) {
      console.error('Failed to fetch dashboard analytics:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'An unexpected error occurred while fetching dashboard analytics.',
      });
    }
  }),

  getAllPosts: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        type: z.enum(['ALL', 'TEXT', 'IMAGE', 'VIDEO']).default('ALL'),
        status: z.enum(['ALL', 'VISIBLE', 'HIDDEN']).default('ALL'),
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
      async ({ input: { limit = 15, cursor, search, type, status }, ctx }) => {
        const { userId, db } = ctx;

        const whereClause: Prisma.PostWhereInput = {};
        const conditions: Prisma.PostWhereInput[] = [{ parentPostId: null }];

        if (search) {
          conditions.push({
            OR: [
              { threadText: { contains: search, mode: 'insensitive' } },
              { text: { contains: search, mode: 'insensitive' } },
              {
                author: { username: { contains: search, mode: 'insensitive' } },
              },
              {
                author: { fullName: { contains: search, mode: 'insensitive' } },
              },
            ],
          });
        }

        if (type === 'TEXT') {
          conditions.push({ threadText: { not: null } });
        } else if (type === 'IMAGE') {
          conditions.push({
            threadText: null,
            media: {
              array_contains: [{ fileType: 'image' }],
            },
          });
        } else if (type === 'VIDEO') {
          conditions.push({
            threadText: null,
            media: {
              array_contains: [{ fileType: 'video' }],
            },
          });
        }

        if (status === 'VISIBLE') {
          conditions.push({ status: PostStatus.VISIBLE });
        } else if (status === 'HIDDEN') {
          conditions.push({ status: PostStatus.HIDDEN });
        }

        if (conditions.length > 0) {
          whereClause.AND = conditions;
        }

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
            repliesCount: true,
            likes: true,
            status: true,
            author: {
              select: {
                ...GET_USER,
              },
            },
            ...getPostRepliesCount(userId!),
          },
        });

        const formattedPosts = posts.map((post) => ({
          ...post,
          media: post.media as PostMedia[],
          likesCount: post.likes.length,
          repliesCount: getTotalRepliesCount(post) as number,
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

  getAllUsers: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.enum(['ALL', 'ACTIVE', 'SUSPENDED', 'BANNED']).default('ALL'),
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      })
    )
    .query(async ({ input: { limit = 15, cursor, search, status }, ctx }) => {
      const { db } = ctx;

      const whereClause: Prisma.UserWhereInput = {};
      const conditions: Prisma.UserWhereInput[] = [{ verified: true }];

      if (search) {
        conditions.push({
          OR: [
            { username: { contains: search, mode: 'insensitive' } },
            { fullName: { contains: search, mode: 'insensitive' } },
          ],
        });
      }

      if (status === 'ACTIVE') {
        conditions.push({ status: UserStatus.ACTIVE });
      } else if (status === 'SUSPENDED') {
        conditions.push({ status: UserStatus.SUSPENDED });
      } else if (status === 'BANNED') {
        conditions.push({ status: UserStatus.BANNED });
      }

      if (conditions.length > 0) {
        whereClause.AND = conditions;
      }

      const users = await db.user.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          createdAt: true,
          username: true,
          fullName: true,
          email: true,
          status: true,
          role: true,
          image: true,
          _count: {
            select: {
              followers: true,
              strikes: true,
              posts: {
                where: {
                  parentPostId: null,
                },
              },
            },
          },
        },
      });

      const formattedUsers = users.map((user) => ({
        ...user,
        followersCount: user._count.followers,
        postsCount: user._count.posts,
        strikesCount: user._count.strikes,
      }));

      let nextCursor: typeof cursor | undefined;
      if (formattedUsers.length > limit) {
        const nextItem = formattedUsers[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        formattedUsers.length = limit;
      }

      return {
        users: formattedUsers,
        nextCursor,
      };
    }),

  issueStrike: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        postId: z.string().optional(),
        reason: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, postId, reason } = input;
      const adminId = ctx.userId;
      const { db } = ctx;

      const user = await db.user.findUnique({
        where: { id: userId },
        include: {
          strikes: {
            where: { expiresAt: { gt: new Date() } },
          },
        },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found.' });
      }

      const activeStrikeCount = user.strikes.length;

      let suspensionEndDate: Date | null = null;
      let userStatus: UserStatus = user.status;
      let clerkStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED' = 'ACTIVE';
      let notificationType: 'WARNING' | 'SUSPENDED' | null = null;
      let notificationMessage: string = '';

      switch (activeStrikeCount) {
        case 0:
          notificationType = 'WARNING';
          notificationMessage =
            'You have received a warning for a policy violation. Please review our community guidelines.';
          break;
        case 1:
          suspensionEndDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
          userStatus = UserStatus.SUSPENDED;
          clerkStatus = 'SUSPENDED';
          notificationType = 'SUSPENDED';
          notificationMessage =
            'Your account has been suspended for 24 hours due to a policy violation.';
          break;
        case 2:
          suspensionEndDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
          userStatus = UserStatus.SUSPENDED;
          clerkStatus = 'SUSPENDED';
          notificationType = 'SUSPENDED';
          notificationMessage =
            'Your account has been suspended for 7 days due to repeated policy violations.';
          break;
        case 3:
          suspensionEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
          userStatus = UserStatus.SUSPENDED;
          clerkStatus = 'SUSPENDED';
          notificationType = 'SUSPENDED';
          notificationMessage =
            'Your account has been suspended for 30 days due to multiple policy violations.';
          break;
        default:
          userStatus = UserStatus.BANNED;
          clerkStatus = 'BANNED';
          break;
      }

      const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

      try {
        await db.$transaction(async (tx) => {
          await tx.strike.create({
            data: {
              userId,
              reason,
              relatedPostId: postId,
              expiresAt: ninetyDaysFromNow,
            },
          });

          if (user.status !== userStatus) {
            await tx.user.update({
              where: { id: userId },
              data: { status: userStatus, suspensionEndDate },
            });
          }

          if (postId) {
            await tx.post.update({
              where: { id: postId },
              data: { status: 'HIDDEN' },
            });
          }

          if (notificationType) {
            await tx.notification.create({
              data: {
                type: notificationType,
                message: notificationMessage,
                receiverUserId: userId,
                senderUserId: adminId,
              },
            });
          }
        });
      } catch (error) {
        console.error('Strike DB Transaction failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to apply strike consequences to the database.',
        });
      }

      await inngest.send({
        name: 'app/strike.process',
        data: {
          userId,
          clerkStatus,
          suspensionEndDate: suspensionEndDate?.toISOString(),
          notificationType,
          notificationMessage,
        },
      });

      return {
        success: true,
        message: 'Strike applied. Processing side effects.',
      };
    }),

  suspendUser: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        suspensionEndDate: z.date(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, suspensionEndDate } = input;
      const { db } = ctx;
      const notificationMessage = `Your account has been suspended until ${suspensionEndDate.toLocaleDateString()} due to multiple policy violations.`;

      try {
        await db.$transaction([
          db.user.update({
            where: { id: userId },
            data: {
              status: UserStatus.SUSPENDED,
              suspensionEndDate,
            },
          }),
          db.notification.create({
            data: {
              type: 'SUSPENDED',
              message: notificationMessage,
              receiverUserId: userId,
              senderUserId: ctx.userId,
            },
          }),
        ]);

        await inngest.send({
          name: 'app/user.suspend',
          data: {
            userId,
            suspensionEndDate: suspensionEndDate?.toISOString(),
            notificationMessage,
          },
        });

        return { success: true };
      } catch (error) {
        console.error('Manual suspension failed:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to suspend user.',
        });
      }
    }),

  unsuspendUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input }) => {
      await inngest.send({
        name: 'app/user.unsuspend',
        data: {
          userId: input.userId,
        },
      });

      return { success: true, message: 'Unsuspension process initiated.' };
    }),
});
