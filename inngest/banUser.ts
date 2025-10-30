import { clerkClient } from '@clerk/nextjs/server';
import { UserStatus } from '@prisma/client';
import { inngest } from './client';
import { db } from '@/server/db';

export const banUser = inngest.createFunction(
  { id: 'process-user-ban' },
  { event: 'app/user.ban' },
  async ({ event, step }) => {
    const { userId } = event.data;

    await step.run('ban-user-in-clerk', async () => {
      try {
        const client = await clerkClient();
        await client.users.banUser(userId);
        return { success: true, message: `Banned user ${userId} in Clerk.` };
      } catch (error) {
        console.error(`Failed to ban user ${userId} in Clerk:`, error);
        throw error;
      }
    });

    await step.sendEvent('send-status-change-notification', {
      name: 'app/notification.send',
      data: {
        userId,
        type: 'BANNED',
        message:
          'Account Permanently Banned: This account has been banned due to repeated policy violations. All associated data has been deleted.',
      },
    });

    await step.run('delete-user-content', async () => {
      try {
        await db.$transaction(async (tx) => {
          const user = await tx.user.findUnique({ where: { id: userId } });

          if (!user) {
            console.warn(`User ${userId} not found, skipping ban.`);
            return;
          }

          await tx.user.delete({
            where: { id: userId },
          });

          await tx.user.create({
            data: {
              id: user.id,
              username: user.username,
              fullName: user.fullName,
              email: user.email,
              createdAt: user.createdAt,
              image: user.image,
              bio: user.bio,
              link: user.link,
              verified: false,
              privacy: user.privacy,
              deactivated: true,
              role: user.role,
              status: UserStatus.BANNED,
            },
          });
        });

        return { success: true, message: `Data deleted for user ${userId}` };
      } catch (error) {
        console.error(
          `Failed to delete data for banned user ${userId}:`,
          error
        );
        throw error;
      }
    });

    return { status: `User ${userId} has been banned successfully.` };
  }
);
