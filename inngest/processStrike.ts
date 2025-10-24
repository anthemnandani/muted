import { clerkClient } from '@clerk/nextjs/server';
import { inngest } from './client';

export const processStrike = inngest.createFunction(
  { id: 'process-strike' },
  { event: 'app/strike.process' },
  async ({ event, step }) => {
    const {
      userId,
      clerkStatus,
      suspensionEndDate: suspensionEndDateISO,
      notificationType,
      notificationMessage,
    } = event.data;

    const suspensionEndDate = suspensionEndDateISO
      ? new Date(suspensionEndDateISO)
      : null;

    await step.run('update-clerk-metadata', async () => {
      await clerkClient.users.updateUserMetadata(userId, {
        publicMetadata: {
          status: clerkStatus,
          suspensionEndDate: suspensionEndDateISO,
        },
      });
    });

    if (notificationType === 'WARNING' || notificationType === 'SUSPENDED') {
      await step.sendEvent('send-notification-event', {
        name: 'app/notification.send',
        data: {
          userId,
          type: notificationType,
          message: notificationMessage,
          suspensionEndDate: suspensionEndDateISO,
        },
      });
    }

    if (suspensionEndDate) {
      await step.sleepUntil('suspension-period', suspensionEndDate);
      await step.sendEvent('schedule-unsuspend-event', {
        name: 'app/user.unsuspend',
        data: { userId },
      });
    }

    return { status: 'Strike side effects processed.' };
  }
);
