import { banUser } from './banUser';
import { processStrike } from './processStrike';
import { sendNotification } from './sendNotification';
import { processUserSuspension } from './suspendUser';
import { unsuspendUser } from './unsuspendUser';
import { processUserStatusChange } from './userStatusChange';

export const functions = [
  processStrike,
  unsuspendUser,
  banUser,
  processUserSuspension,
  sendNotification,
  processUserStatusChange,
];
