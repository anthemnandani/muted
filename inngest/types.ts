import type { EventPayload } from 'inngest';

export interface ProcessStrike extends EventPayload {
  name: 'app/strike.process';
  data: {
    userId: string;
    clerkStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
    suspensionEndDate?: string;
    notificationType: 'WARNING' | 'SUSPENDED' | null;
    notificationMessage: string;
  };
}

export interface UnsuspendUser extends EventPayload {
  name: 'app/user.unsuspend';
  data: {
    userId: string;
  };
}

export interface SendNotification extends EventPayload {
  name: 'app/notification.send';
  data: {
    userId: string;
    type: 'WARNING' | 'SUSPENDED' | 'UNSUSPENDED' | null;
    message: string;
    suspensionEndDate?: string;
  };
}
