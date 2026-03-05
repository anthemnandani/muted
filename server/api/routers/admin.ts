import { Prisma } from '@/generated/prisma/client';
import {
  AppealStatus,
  FileType,
  NotificationType,
  PostStatus,
  ReportStatus,
  Role,
  SuspensionType,
  UserStatus,
} from '@/generated/prisma/enums';
import { inngest } from '@/inngest/client';
import {
  enrichPostWithTokens,
  enrichThumbnailToken,
  getChartDataTemplate,
} from '@/lib/utils';
import { GET_MENTIONS, GET_USER, getPostReplies } from '@/server/constants';
import { clerkClient } from '@clerk/nextjs/server';
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
        `Clerk API error (Axios): ${error.response?.data || error.message}`,
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
      const { targetUserId, role } = input;
      const { db, userId } = ctx;
      try {
        await db.$transaction(async (tx) => {
          await tx.user.update({
            where: { id: targetUserId },
            data: { role },
          });

          let notifType: NotificationType;
          let notifMessage: string;

          if (role === Role.ADMIN) {
            notifType = NotificationType.ADMIN_PROMOTED;
            notifMessage = 'Your account has been promoted to an Admin role.';
          } else {
            notifType = NotificationType.ADMIN_DEMOTED;
            notifMessage = 'Your account has been demoted to a User role.';
          }

          await tx.notification.create({
            data: {
              type: notifType,
              message: notifMessage,
              receiverUserId: targetUserId,
              senderUserId: userId,
            },
          });
        });
      } catch (dbError) {
        console.error('Failed to update user role in database:', dbError);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update user role.',
        });
      }

      try {
        const client = await clerkClient();
        await client.users.updateUserMetadata(targetUserId, {
          publicMetadata: {
            role,
          },
        });
      } catch (clerkError) {
        console.error(
          `CRITICAL: DB update for user ${targetUserId} succeeded, but Clerk metadata update failed.`,
          clerkError,
        );

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message:
            'Database role updated, but failed to sync with Clerk. Please check logs.',
        });
      }

      return { success: true };
    }),

  deletePost: adminProcedure
    .input(
      z.object({
        id: z.string(),
      }),
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
        (new Date().getTime() - sixMonthsAgo.getTime()) / (1000 * 3600 * 24),
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
        type: z.enum(['ALL', 'IMAGE', 'VIDEO']).default('ALL'),
        status: z.enum(['ALL', 'VISIBLE', 'HIDDEN']).default('ALL'),
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
      async ({ input: { limit = 15, cursor, search, type, status }, ctx }) => {
        const { userId, db } = ctx;

        const whereClause: Prisma.PostWhereInput = {};
        const conditions: Prisma.PostWhereInput[] = [{ parentPostId: null }];

        if (search) {
          conditions.push({
            OR: [
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

        if (type === 'IMAGE') {
          conditions.push({
            media: {
              some: { fileType: FileType.IMAGE },
            },
          });
        } else if (type === 'VIDEO') {
          conditions.push({
            media: {
              some: { fileType: FileType.VIDEO },
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
            ...getPostReplies(userId!),
          },
        });

        const formattedPosts = await Promise.all(
          posts.map(async (post) => {
            const postWithTokens = await enrichPostWithTokens(post);
            return {
              ...postWithTokens,
              likesCount: post.likes.length,
            };
          }),
        );

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
      },
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
      }),
    )
    .query(async ({ input: { limit = 15, cursor, search, status }, ctx }) => {
      const { db } = ctx;

      const whereClause: Prisma.UserWhereInput = {};
      const conditions: Prisma.UserWhereInput[] = [];

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

  getAppeals: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.nativeEnum(AppealStatus).optional(),
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      }),
    )
    .query(async ({ input: { limit = 15, cursor, status, search }, ctx }) => {
      const { db } = ctx;

      const conditions: Prisma.AppealWhereInput[] = [];

      if (status) {
        conditions.push({ status });
      }

      if (search) {
        conditions.push({
          user: {
            OR: [
              { username: { contains: search, mode: 'insensitive' } },
              { fullName: { contains: search, mode: 'insensitive' } },
            ],
          },
        });
      }

      const whereClause: Prisma.AppealWhereInput =
        conditions.length > 0 ? { AND: conditions } : {};

      const appeals = await db.appeal.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          user: {
            select: {
              id: true,
              username: true,
              fullName: true,
              image: true,
            },
          },
          suspension: {
            select: {
              id: true,
              createdAt: true,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (appeals.length > limit) {
        const nextItem = appeals[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        appeals.length = limit;
      }

      return { appeals, nextCursor };
    }),

  getAllReports: adminProcedure
    .input(
      z.object({
        search: z.string().optional(),
        status: z.nativeEnum(ReportStatus).optional(),
        limit: z.number().optional(),
        cursor: z
          .object({
            id: z.string(),
            createdAt: z.date(),
          })
          .optional(),
      }),
    )
    .query(async ({ input: { limit = 15, cursor, status, search }, ctx }) => {
      const { db } = ctx;
      const conditions: Prisma.ReportWhereInput[] = [];

      if (status) {
        conditions.push({ status });
      }

      if (search) {
        conditions.push({
          OR: [
            { reason: { contains: search, mode: 'insensitive' } },
            {
              reporter: {
                username: { contains: search, mode: 'insensitive' },
              },
            },
            {
              reporter: {
                fullName: { contains: search, mode: 'insensitive' },
              },
            },
            {
              targetUser: {
                username: { contains: search, mode: 'insensitive' },
              },
            },
            {
              targetUser: {
                fullName: { contains: search, mode: 'insensitive' },
              },
            },
            {
              post: { text: { contains: search, mode: 'insensitive' } },
            },
          ],
        });
      }

      const whereClause: Prisma.ReportWhereInput =
        conditions.length > 0 ? { AND: conditions } : {};

      const reports = await db.report.findMany({
        where: whereClause,
        take: limit + 1,
        cursor: cursor ? { createdAt_id: cursor } : undefined,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        include: {
          reporter: {
            select: { id: true, username: true, fullName: true, image: true },
          },
          user: {
            select: { id: true, username: true, fullName: true, image: true },
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
              hideLikes: true,
              turnOffComments: true,
              pinned: true,
              privacy: true,
              repliesCount: true,
              likes: true,
              status: true,
              author: {
                select: { ...GET_USER },
              },
              ...GET_MENTIONS,
            },
          },
        },
      });

      let nextCursor: typeof cursor | undefined;
      if (reports.length > limit) {
        const nextItem = reports[limit];
        nextCursor = {
          id: nextItem.id,
          createdAt: nextItem.createdAt,
        };
        reports.length = limit;
      }

      const formattedReports = await Promise.all(
        reports.map(async (report) => {
          if (report.post) {
            return {
              ...report,
              post: {
                ...report.post,
                media: await enrichThumbnailToken(report.post.media),
              },
            };
          }
          return {
            ...report,
            post: null,
          };
        }),
      );

      return {
        reports: formattedReports,
        nextCursor,
      };
    }),

  issueStrike: adminProcedure
    .input(
      z.object({
        userId: z.string(),
        reason: z.string(),
        postId: z.string().optional(),
        reportId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, postId, reason, reportId } = input;
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
      let notificationType: 'WARNING' | 'SUSPENDED' | 'BANNED' | null = null;
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
          notificationType = 'BANNED';
          notificationMessage =
            'Account Permanently Banned: This account has been banned due to repeated policy violations. All associated data has been deleted.';
          break;
      }

      const ninetyDaysFromNow = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

      try {
        await db.$transaction(async (tx) => {
          const newStrike = await tx.strike.create({
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

          if (suspensionEndDate) {
            await tx.suspension.create({
              data: {
                endsAt: suspensionEndDate,
                type: SuspensionType.STRIKE_BASED,
                userId,
                strikeId: newStrike.id,
              },
            });
          }

          if (postId) {
            await tx.post.update({
              where: { id: postId },
              data: { status: 'HIDDEN' },
            });
          }

          if (reportId) {
            await tx.report.update({
              where: { id: reportId },
              data: { status: ReportStatus.ACTIONED },
            });
          }

          if (notificationType && notificationType !== 'BANNED') {
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
      }),
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

          db.suspension.create({
            data: {
              endsAt: suspensionEndDate,
              type: SuspensionType.MANUAL,
              userId,
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
    .mutation(async ({ input, ctx }) => {
      const { db } = ctx;
      const { userId } = input;
      await db.$transaction([
        db.suspension.updateMany({
          where: { userId, isActive: true },
          data: { isActive: false },
        }),
        db.user.update({
          where: { id: userId },
          data: { status: UserStatus.ACTIVE, suspensionEndDate: null },
        }),
        db.notification.create({
          data: {
            type: 'UNSUSPENDED',
            message: 'Your account suspension has been lifted. Welcome back!',
            receiverUserId: userId,
          },
        }),
      ]);

      await inngest.send({
        name: 'app/user.unsuspend',
        data: {
          userId: input.userId,
          isManual: true,
        },
      });

      return { success: true, message: 'Unsuspension process initiated.' };
    }),

  reviewAppeal: adminProcedure
    .input(
      z.object({
        appealId: z.string(),
        decision: z.enum([AppealStatus.UPHELD, AppealStatus.OVERTURNED]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { appealId, decision } = input;

      const appeal = await db.appeal.findUnique({
        where: { id: appealId },
        include: {
          suspension: {
            select: { id: true, userId: true },
          },
        },
      });

      if (!appeal || appeal.status !== AppealStatus.PENDING) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Pending appeal not found.',
        });
      }

      await db.appeal.update({
        where: { id: appealId },
        data: { status: decision },
      });

      if (decision === AppealStatus.OVERTURNED) {
        await inngest.send({
          name: 'app/user.unsuspend',
          data: {
            userId: appeal.suspension.userId,
            isManual: false,
          },
        });
      }

      return { success: true };
    }),

  banUser: adminProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      (await ctx.db.user.update({
        where: { id: input.userId },
        data: {
          status: UserStatus.BANNED,
        },
      }),
        await inngest.send({
          name: 'app/user.ban',
          data: {
            userId: input.userId,
          },
        }));

      return { success: true, message: 'User ban process initiated.' };
    }),

  dismissReport: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;
      const { id } = input;

      const report = await db.report.findUnique({
        where: { id },
      });

      if (!report) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Report not found.',
        });
      }

      if (report.status !== ReportStatus.PENDING) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This report has already been reviewed.',
        });
      }

      await db.report.update({
        where: { id },
        data: { status: ReportStatus.DISMISSED },
      });

      return { success: true };
    }),

  getAllPages: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.page.findMany({
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        title: true,
        slug: true,
        updatedAt: true,
      },
    });
  }),

  getPage: adminProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.page.findUnique({
        where: { slug: input.slug },
      });
    }),

  upsertPage: adminProcedure
    .input(
      z.object({
        slug: z.string(),
        title: z.string(),
        content: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.page.upsert({
        where: { slug: input.slug },
        update: {
          title: input.title,
          content: input.content,
        },
        create: {
          slug: input.slug,
          title: input.title,
          content: input.content,
        },
      });
    }),

  deletePage: adminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.page.delete({
        where: { id: input.id },
      });
    }),
});
