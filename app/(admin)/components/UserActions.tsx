'use client';

import BanUser from '@/components/modals/BanUser';
import SuspendUser from '@/components/modals/SuspendUser';
import { Button } from '@/components/ui/button';
import { UserActionsProps } from '@/lib/types';
import { Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';

const UserActions = ({
  id,
  username,
  isSuspended,
  isBanned,
}: UserActionsProps) => {
  const router = useRouter();

  return (
    <div className='flex-center gap-1'>
      <Button
        variant='ghost'
        size='icon'
        className='hover:bg-white/10'
        title='View Profile'
        onClick={() => router.push(`/@${username}`)}
      >
        <Eye className='size-5 text-white/80' />
        <span className='sr-only'>View user profile</span>
      </Button>

      <SuspendUser isSuspended={isSuspended} userId={id} />

      <BanUser isBanned={isBanned} userId={id} />
    </div>
  );
};

export default UserActions;
