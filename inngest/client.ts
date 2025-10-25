import { EventSchemas, Inngest } from 'inngest';
import type {
  SuspendUser,
  UserStatusChanged,
  ProcessStrike,
  SendNotification,
  UnsuspendUser,
} from './types';

export const inngest = new Inngest({
  id: 'muted',
  schemas: new EventSchemas().fromUnion<
    | ProcessStrike
    | UnsuspendUser
    | SuspendUser
    | SendNotification
    | UserStatusChanged
  >(),
});
