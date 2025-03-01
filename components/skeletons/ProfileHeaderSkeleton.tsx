import React from 'react';
import { Skeleton } from '../ui/skeleton';

const ProfileHeaderSkeleton = () => {
  return (
    <div className='flex items-center relative min-h-[140px] mb-5 gap-7 flex-[0_0_auto]'>
      <Skeleton className='size-[212px] rounded-full' />

      <div className='flex flex-col justify-between flex-[1_1_0%] gap-5 overflow-visible'>
        <div className='flex flex-col gap-3'>
          <Skeleton className='h-6 w-48' />
          <Skeleton className='h-4 w-32' />
        </div>

        <div className='flex items-center gap-5'>
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-20' />
          <Skeleton className='h-4 w-20' />
        </div>

        <div className='flex flex-col gap-2'>
          <Skeleton className='h-3.5 w-[35%]' />
          <Skeleton className='h-3.5 w-[30%]' />
        </div>
      </div>
    </div>
  );
};

export default ProfileHeaderSkeleton;
