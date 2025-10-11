import useToggleMuteUser from '@/hooks/useToggleMuteUser';
import { MutedPostProps } from '@/lib/types';
import { UndoIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';

const MutedPost: React.FC<MutedPostProps> = ({ userId, username }) => {
  const { handleToggleMuteUser, isLoading } = useToggleMuteUser({
    userId,
  });

  const toggleMuteUser = () => {
    handleToggleMuteUser({ userId });
  };

  return (
    <div className='-ml-14 w-full max-w-[calc((0px-2rem+100vh)*0.5625)] h-[calc(0px-2rem+100vh)] flex-center relative snap-center snap-always'>
      <div className='relative h-full w-full overflow-hidden flex-center cursor-pointer bg-gray-6 rounded-2xl'>
        <div className='flex-col-center gap-3 text-center p-6'>
          <h3 className='text-xl font-medium text-neutral-100'>
            Posts from {username} are muted
          </h3>
          <p className='text-base text-neutral-400 mb-2'>
            You won't see posts from this user in your feed
          </p>
          <Button
            variant='outline'
            size='sm'
            className='rounded-full border-neutral-700 text-neutral-100 hover:bg-neutral-700/10 hover:text-neutral-100 gap-2'
            onClick={toggleMuteUser}
            disabled={isLoading}
          >
            <UndoIcon className='size-4' />
            <span>Undo</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MutedPost;
