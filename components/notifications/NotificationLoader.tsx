import React from 'react';
import NotificationSkeleton from '../skeletons/NotificationSkeleton';

const NotificationLoader = () => {
  return (
    <div className='flex-1 overflow-auto'>
      <div className='space-y-0'>
        {Array.from({ length: 8 }).map((_, index) => (
          <NotificationSkeleton key={index} />
        ))}
      </div>
    </div>
  );
};

export default NotificationLoader;
