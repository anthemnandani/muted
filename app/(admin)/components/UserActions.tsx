'use client';

import BanUser from '@/components/modals/BanUser';
import SuspendUser from '@/components/modals/SuspendUser';
import ToggleAdmin from '@/components/modals/ToggleAdmin';
import { UserActionsProps } from '@/lib/types';

const UserActions = ({ id, role, isSuspended, isBanned }: UserActionsProps) => {
  return (
    <div className='flex-center'>
      <ToggleAdmin userId={id} currentRole={role} />
      <SuspendUser isSuspended={isSuspended} userId={id} />
      <BanUser isBanned={isBanned} userId={id} />
    </div>
  );
};

export default UserActions;
