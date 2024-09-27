import { getUserEmail } from '@/lib/utils';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { clerkClient } from '@clerk/nextjs';
import { Privacy } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const authRouter = createTRPCRouter({
  accountSetup: privateProcedure
    .input(
      z.object({
        bio: z.string(),
        link: z.string(),
        privacy: z.nativeEnum(Privacy),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, user } = ctx;
      if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

      const email = getUserEmail(user);

      const dbUser = await ctx.db.user.findUnique({
        where: {
          email,
        },
      });

      if (!dbUser) {
        throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
      }
      console.log('Db User: ', dbUser);
      await ctx.db.$transaction(async (prisma) => {
        const updatedUser = await prisma.user.update({
          where: {
            id: dbUser.id,
          },
          data: {
            privacy: input.privacy,
            bio: input.bio,
            link: input.link,
            verified: true,
          },
        });

        const params = {
          username: updatedUser.username,
        };

        await clerkClient.users.updateUser(userId, params);

        await prisma.notification.create({
          data: {
            isPublic: false,
            type: 'ADMIN',
            senderUserId: process.env.ADMIN_USER_ID!,
            receiverUserId: updatedUser.id,
            message: `Hey ${updatedUser.fullName}! Welcome to Muted.`,
          },
        });
      });

      return {
        success: true,
      };
    }),
});
