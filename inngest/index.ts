import { processStrike } from './processStrike';
import { sendNotification } from './sendNotification';
import { unsuspendUser } from './unsuspendUser';

export const functions = [processStrike, unsuspendUser, sendNotification];
