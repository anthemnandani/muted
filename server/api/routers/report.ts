import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '../trpc';

export const reportRouter = createTRPCRouter({
  createReport: privateProcedure
    .input(
      z.object({
        threadId: z.string().optional(),
        postId: z.string().optional(),
        userId: z.string().optional(),
        categoryId: z.string(),
        subCategoryId: z.string().optional(),
        detailId: z.string().optional(),
        reason: z.string(),
        additionalInfo: z.string().optional(),
        targetUserId: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { db } = ctx;

      const {
        postId,
        threadId,
        userId,
        categoryId,
        subCategoryId,
        detailId,
        reason,
        additionalInfo,
        targetUserId,
      } = input;

      if (!postId && !userId && !threadId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Either postId or userId or threadId must be provided',
        });
      }

      let existingReport = null;

      if (postId) {
        existingReport = await db.report.findUnique({
          where: {
            reporterId_postId: {
              reporterId: ctx.userId!,
              postId: postId,
            },
          },
        });
      } else if (threadId) {
        existingReport = await db.report.findUnique({
          where: {
            reporterId_threadId: {
              reporterId: ctx.userId!,
              threadId,
            },
          },
        });
      } else if (userId) {
        existingReport = await db.report.findUnique({
          where: {
            reporterId_userId: {
              reporterId: ctx.userId!,
              userId,
            },
          },
        });
      }

      if (existingReport) {
        const updatedReport = await db.report.update({
          where: { id: existingReport.id },
          data: {
            categoryId,
            subCategoryId: subCategoryId ?? null,
            detailId: detailId ?? null,
            reason,
            additionalInfo: additionalInfo ?? null,
            targetUserId: targetUserId ?? null,
            updatedAt: new Date(),
          },
        });

        return {
          success: true,
          report: updatedReport,
          isNew: false,
        };
      }

      const report = await db.report.create({
        data: {
          reporterId: ctx.userId!,
          postId,
          threadId,
          userId,
          categoryId,
          subCategoryId: subCategoryId ?? null,
          detailId: detailId ?? null,
          reason,
          targetUserId: targetUserId ?? null,
          additionalInfo: additionalInfo ?? null,
        },
      });

      return {
        success: true,
        report,
        isNew: true,
      };
    }),
});
