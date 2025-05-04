import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, privateProcedure } from '../trpc';

export const reportRouter = createTRPCRouter({
  createReport: privateProcedure
    .input(
      z.object({
        postId: z.string().optional(),
        userId: z.string().optional(),
        categoryId: z.string(),
        subCategoryId: z.string().optional(),
        detailId: z.string().optional(),
        reason: z.string(),
        additionalInfo: z.string().optional(),
        targetUserId: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const {
        postId,
        userId,
        categoryId,
        subCategoryId,
        detailId,
        reason,
        additionalInfo,
        targetUserId,
      } = input;

      if (!postId && !userId) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Either postId or userId must be provided',
        });
      }

      let existingReport = null;

      if (postId) {
        existingReport = await ctx.db.report.findUnique({
          where: {
            reporterId_postId: {
              reporterId: ctx.userId!,
              postId: postId,
            },
          },
        });
      } else if (userId) {
        existingReport = await ctx.db.report.findUnique({
          where: {
            reporterId_userId: {
              reporterId: ctx.userId!,
              userId: userId,
            },
          },
        });
      }

      if (existingReport) {
        const updatedReport = await ctx.db.report.update({
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

      const report = await ctx.db.report.create({
        data: {
          reporterId: ctx.userId!,
          postId,
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
