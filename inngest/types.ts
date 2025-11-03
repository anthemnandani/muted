import type { EventPayload } from 'inngest';

export interface ProcessStrike extends EventPayload {
  name: 'app/strike.process';
  data: {
    userId: string;
    clerkStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
    suspensionEndDate?: string;
    notificationType: 'WARNING' | 'SUSPENDED' | 'BANNED' | null;
    notificationMessage: string;
  };
}

export interface BanUser extends EventPayload {
  name: 'app/user.ban';
  data: {
    userId: string;
  };
}

export interface UnsuspendUser extends EventPayload {
  name: 'app/user.unsuspend';
  data: {
    userId: string;
    isManual: boolean;
  };
}

export interface SuspendUser extends EventPayload {
  name: 'app/user.suspend';
  data: {
    userId: string;
    suspensionEndDate?: string;
    notificationMessage: string;
  };
}

export interface SendNotification extends EventPayload {
  name: 'app/notification.send';
  data: {
    userId: string;
    type: 'WARNING' | 'SUSPENDED' | 'UNSUSPENDED' | 'BANNED' | null;
    message: string;
    suspensionEndDate?: string;
  };
}

export interface UserStatusChanged extends EventPayload {
  name: 'app/user.status-changed';
  data: {
    userId: string;
    clerkStatus: 'ACTIVE' | 'SUSPENDED' | 'BANNED';
    suspensionEndDate?: string;
    notificationType: 'WARNING' | 'SUSPENDED' | 'BANNED' | null;
    notificationMessage: string;
  };
}
