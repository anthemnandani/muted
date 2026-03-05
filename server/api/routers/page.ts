import z from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const pageRouter = createTRPCRouter({
  getAllPages: publicProcedure.query(async ({ ctx }) => {
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

  getPage: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.page.findUnique({
        where: { slug: input.slug },
      });
    }),
});
