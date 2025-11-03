import { db } from '@/server/db';
import { clerkClient } from '@clerk/nextjs/server';
import { UserStatus } from '@prisma/client';
import { inngest } from './client';

export const unsuspendUser = inngest.createFunction(
  { id: 'unsuspend-user' },
  { event: 'app/user.unsuspend' },
  async ({ event, step }) => {
    const { userId, isManual } = event.data;

    const notificationMessage =
      'Your account suspension has been lifted. Welcome back!';

    const client = await clerkClient();

    if (isManual) {
      await step.run('sync-clerk-manual', async () => {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: { status: 'ACTIVE', suspensionEndDate: null },
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

      return { status: 'User manually unsuspended by admin.' };
    }

    await step.run('deactivate-expired-suspensions', async () => {
      return await db.suspension.updateMany({
        where: {
          userId,
          isActive: true,
          endsAt: { lte: new Date() },
        },
        data: { isActive: false },
      });
    });

    const longestRemainingSuspension = await step.run(
      'check-for-remaining-suspensions',
      async () => {
        return await db.suspension.findFirst({
          where: {
            userId,
            isActive: true,
          },
          orderBy: { endsAt: 'desc' },
        });
      }
    );

    if (longestRemainingSuspension) {
      await step.run('update-user-end-date', async () => {
        await db.user.update({
          where: { id: userId },
          data: { suspensionEndDate: longestRemainingSuspension.endsAt },
        });
      });

      await step.run('sync-clerk-new-date', async () => {
        await client.users.updateUserMetadata(userId, {
          publicMetadata: {
            status: 'SUSPENDED',
            suspensionEndDate: longestRemainingSuspension.endsAt,
          },
        });
      });

      return {
        status: `Suspension expired, but user remains suspended until ${longestRemainingSuspension.endsAt}.`,
      };
    }

    await step.run('final-unsuspend-db', async () => {
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
    });

    await step.run('sync-clerk-auto', async () => {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: { status: 'ACTIVE', suspensionEndDate: null },
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

    return { status: 'User automatically unsuspended.' };
  }
);
