import { inngest } from './client';

export const processUserSuspension = inngest.createFunction(
  { id: 'process-user-suspension' },
  { event: 'app/user.suspend' },
  async ({ event, step }) => {
    const { userId, suspensionEndDate, notificationMessage } = event.data;

    await step.sendEvent('trigger-status-change', {
      name: 'app/user.status-changed',
      data: {
        userId,
        clerkStatus: 'SUSPENDED',
        suspensionEndDate,
        notificationType: 'SUSPENDED',
        notificationMessage,
      },
    });

    return { status: 'Manual suspension event forwarded.' };
  }
);
