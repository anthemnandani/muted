import { getChartDataTemplate } from '@/lib/utils';
import { clerkClient } from '@clerk/nextjs/server';
import { Role } from '@prisma/client';
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
        ctx.db.post.count(),
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
});
