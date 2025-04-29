'use client';

import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';

const BlockedUserContent = () => {
  return (
    <div className='main-container'>
      <div className='flex flex-col flex-[1_1_auto]'>
        <div className='flex-col-center w-full h-full'>
          <EmptyState
            icon={<Icons.userLock className='size-11 text-white/90' />}
            title='No content'
            description="You can't view the posts due to this user's privacy settings."
          />
        </div>
      </div>
    </div>
  );
};

export default BlockedUserContent;
