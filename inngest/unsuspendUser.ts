import { db } from '@/server/db';
import { clerkClient } from '@clerk/nextjs/server';
import { UserStatus } from '@prisma/client';
import { inngest } from './client';

export const unsuspendUser = inngest.createFunction(
  { id: 'unsuspend-user' },
  { event: 'app/user.unsuspend' },
  async ({ event, step }) => {
    const { userId } = event.data;
    const notificationMessage =
      'Your account suspension has been lifted. Welcome back!';

    const client = await clerkClient();

    await step.run('update-user-status-and-notify', async () => {
      await db.$transaction([
        db.user.update({
          where: { id: userId },
          data: { status: UserStatus.ACTIVE, suspensionEndDate: null },
        }),
        db.notification.create({
          data: {
            type: 'UNSUSPENDED',
            message: notificationMessage,
            receiverUserId: userId,
          },
        }),
      ]);
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          status: 'ACTIVE',
          suspensionEndDate: null,
        },
      });
    });

    await step.sendEvent('send-unsuspend-notification', {
      name: 'app/notification.send',
      data: {
        userId,
        type: 'UNSUSPENDED',
        message: notificationMessage,
      },
    });

    return { status: 'User unsuspended' };
  }
);
