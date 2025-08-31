'use client';

import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';

const DeletedUserContent = () => {
  return (
    <div className='flex-center w-full h-full'>
      <div className='flex flex-col items-center text-center'>
        <EmptyState
          icon={<Icons.userRound className='size-12 text-white/90' />}
          title="Couldn't find this account"
          description='Try exploring the latest posts or starting a new search.'
        />
      </div>
    </div>
  );
};

export default DeletedUserContent;
