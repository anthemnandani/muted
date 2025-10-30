import { EventSchemas, Inngest } from 'inngest';
import type {
  SuspendUser,
  UserStatusChanged,
  ProcessStrike,
  SendNotification,
  UnsuspendUser,
  BanUser,
} from './types';

export const inngest = new Inngest({
  id: 'muted',
  schemas: new EventSchemas().fromUnion<
    | ProcessStrike
    | BanUser
    | UnsuspendUser
    | SuspendUser
    | SendNotification
    | UserStatusChanged
  >(),
});
