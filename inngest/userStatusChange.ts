import { clerkClient } from '@clerk/nextjs/server';
import { inngest } from './client';

export const processUserStatusChange = inngest.createFunction(
  {
    id: 'process-user-status-change',
    cancelOn: [
      {
        event: 'app/user.unsuspend',
        if: 'async.data.userId == event.data.userId',
      },
    ],
  },
  {
    event: 'app/user.status-changed',
  },
  async ({ event, step }) => {
    const {
      userId,
      clerkStatus,
      suspensionEndDate,
      notificationType,
      notificationMessage,
    } = event.data;

    const client = await clerkClient();

    await step.run('update-clerk-metadata', async () => {
      await client.users.updateUserMetadata(userId, {
        publicMetadata: {
          status: clerkStatus,
          suspensionEndDate: suspensionEndDate
            ? new Date(suspensionEndDate)
            : null,
        },
      });
    });

    if (notificationType && notificationMessage) {
      await step.sendEvent('send-status-change-notification', {
        name: 'app/notification.send',
        data: {
          userId,
          type: notificationType,
          message: notificationMessage,
        },
      });
    }

    if (clerkStatus === 'BANNED') {
      await step.sendEvent('trigger-ban-user', {
        name: 'app/user.ban',
        data: { userId },
      });
    }

    if (clerkStatus === 'SUSPENDED' && suspensionEndDate) {
      const unsuspendAt = new Date(suspensionEndDate);
      await step.sleepUntil('wait-for-suspension-end', unsuspendAt);

      await step.sendEvent('schedule-unsuspend', {
        name: 'app/user.unsuspend',
        data: { userId, isManual: false },
      });
    }

    return {
      status: `User ${userId} status updated to ${clerkStatus} in Clerk.`,
    };
  }
);
