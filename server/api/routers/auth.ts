// import { Privacy } from '@/generated/prisma/enums';
// import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
// import { TRPCError } from '@trpc/server';
// import { z } from 'zod';

// export const authRouter = createTRPCRouter({
//   accountSetup: privateProcedure
//     .input(
//       z.object({
//         bio: z.string(),
//         link: z.string(),
//         privacy: z.nativeEnum(Privacy),
//       }),
//     )
//     .mutation(async ({ ctx, input }) => {
//       const { userId, db } = ctx;
//       if (!userId) throw new TRPCError({ code: 'UNAUTHORIZED' });

//       const dbUser = await db.user.findUnique({
//         where: {
//           id: userId,
//         },
//       });

//       if (!dbUser) {
//         throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR' });
//       }

//       await db.$transaction(async (prisma) => {
//         await prisma.user.update({
//           where: {
//             id: dbUser.id,
//           },
//           data: {
//             privacy: input.privacy,
//             bio: input.bio,
//             link: input.link,
//             verified: true,
//           },
//         });

//         // await prisma.notification.create({
//         //   data: {
//         //     isPublic: false,
//         //     type: 'ADMIN',
//         //     senderUserId: process.env.ADMIN_USER_ID!,
//         //     receiverUserId: updatedUser.id,
//         //     message: `Hey ${updatedUser.fullName}! Welcome to Muted.`,
//         //   },
//         // });
//       });

//       return {
//         success: true,
//       };
//     }),
// });


import { CollectionPrivacy, Privacy } from '@/generated/prisma/enums';
import { getFullName } from '@/lib/utils';
import { createTRPCRouter, privateProcedure } from '@/server/api/trpc';
import { TRPCError } from '@trpc/server';
import { z } from 'zod';

export const authRouter = createTRPCRouter({
  accountSetup: privateProcedure
    .input(
      z.object({
        bio: z.string(),
        link: z.string(),
        privacy: z.nativeEnum(Privacy),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { userId, db, user } = ctx;

      // 🔐 Auth check
      if (!userId) {
        throw new TRPCError({ code: 'UNAUTHORIZED' });
      }

      try {
        // 📧 Safe email extraction (Clerk)
        const email =
          user?.primaryEmailAddress?.emailAddress ||
          user?.emailAddresses?.[0]?.emailAddress;

        if (!email) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'User email not found',
          });
        }

        // 👤 Name handling
        const fullName = getFullName(
          user?.firstName ?? '',
          user?.lastName ?? '',
        );

        // 🆔 Safe unique username
        const username =
          user?.username?.trim() ||
          `user_${userId.slice(-6)}_${Date.now()}`;

        // 💾 UPSERT user (create if not exists, update if exists)
        await db.user.upsert({
          where: {
            id: userId,
          },
          update: {
            privacy: input.privacy,
            bio: input.bio,
            link: input.link,
            verified: true,
          },
          create: {
            id: userId,
            fullName: fullName || null,
            username,
            email,
            image: user?.imageUrl ?? null,
            privacy: input.privacy,
            bio: input.bio,
            link: input.link,
            verified: true,
            collections: {
              create: {
                name: 'All Posts',
                isDefault: true,
                privacy: CollectionPrivacy.PRIVATE,
              },
            },
          },
        });

        return {
          success: true,
        };

      } catch (error) {
        // 🔥 Proper debugging log
        console.error('🔥 accountSetup ERROR:', error);

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to setup account',
        });
      }
    }),
});