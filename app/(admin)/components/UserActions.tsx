'use client';

import SuspendUser from '@/components/modals/SuspendUser';
import { Button } from '@/components/ui/button';
import { UserActionsProps } from '@/lib/types';
import { Eye, ShieldAlert, ShieldCheck } from 'lucide-react';
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

      <Button
        variant='ghost'
        size='icon'
        className='hover:bg-white/10'
        title={isBanned ? 'Unban' : 'Ban'}
      >
        {isBanned ? (
          <ShieldCheck className='size-5 text-green-500' />
        ) : (
          <ShieldAlert className='size-5 text-red-500' />
        )}
        <span className='sr-only'>{isBanned ? 'Unban user' : 'Ban user'}</span>
      </Button>
    </div>
  );
};

export default UserActions;
