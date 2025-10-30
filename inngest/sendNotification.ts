import axios from 'axios';
import { inngest } from './client';

export const sendNotification = inngest.createFunction(
  { id: 'send-realtime-notification' },
  { event: 'app/notification.send' },
  async ({ event }) => {
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/dispatch-event`,
        event.data
      );
      return { status: 'Notification dispatched' };
    } catch (error) {
      console.error('Failed to dispatch notification:', error);
      throw error;
    }
  }
);
