import { AppealStatus } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import z from 'zod';
import { createTRPCRouter, privateProcedure } from '../trpc';

export const appealRouter = createTRPCRouter({
  getSuspensionDetails: privateProcedure.query(async ({ ctx }) => {
    const { userId, db } = ctx;

    const activeSuspension = await db.suspension.findFirst({
      where: {
        userId,
        isActive: true,
      },
      include: {
        appeal: true,
      },
    });

    if (!activeSuspension) {
      return {
        isSuspended: false,
        suspension: null,
        appeal: null,
      };
    }

    return {
      isSuspended: true,
      suspension: activeSuspension,
      appeal: activeSuspension.appeal,
    };
  }),

  submitAppeal: privateProcedure
    .input(
      z.object({
        reason: z
          .string()
          .min(20, 'Please provide a detailed reason (at least 20 characters).')
          .max(250, 'Your reason must be under 250 characters.'),
        suspensionId: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db } = ctx;

      if (!userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You must be logged in to submit an appeal.',
        });
      }

      const suspension = await db.suspension.findFirst({
        where: {
          id: input.suspensionId,
          userId: userId,
          isActive: true,
        },
        include: { appeal: true },
      });

      if (!suspension) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'No active suspension found to appeal.',
        });
      }

      if (suspension.appeal) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You have already submitted an appeal for this suspension.',
        });
      }

      const appeal = await db.appeal.create({
        data: {
          reason: input.reason,
          status: AppealStatus.PENDING,
          userId,
          suspensionId: suspension.id,
        },
      });

      return { success: true, appeal };
    }),
});
