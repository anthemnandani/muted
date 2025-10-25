import { inngest } from './client';

export const processStrike = inngest.createFunction(
  { id: 'process-strike' },
  { event: 'app/strike.process' },
  async ({ event, step }) => {
    await step.sendEvent('trigger-status-change-from-strike', {
      name: 'app/user.status-changed',
      data: event.data,
    });

    return { status: 'Strike side effects processed.' };
  }
);
