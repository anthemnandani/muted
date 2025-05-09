import { z } from 'zod';
import { createTRPCRouter, publicProcedure } from '../trpc';

export const searchRouter = createTRPCRouter({
  getSearchResults: publicProcedure
    .input(
      z.object({
        query: z.string().min(1),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const { query } = input;

        try {
          await ctx.db.searchQuery.upsert({
            where: { query },
            update: {
              count: { increment: 1 },
              updatedAt: new Date(),
            },
            create: {
              query,
              count: 1,
            },
          });
        } catch (error) {
          console.error('Failed to log search query:', error);
        }

        const users = await ctx.db.user.findMany({
          where: {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { fullName: { contains: query, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            username: true,
            fullName: true,
            image: true,
          },
          take: 3,
        });

        return users;
      } catch (error) {
        console.error('Search query error:', error);
        throw new Error('Failed to perform search');
      }
    }),
});
