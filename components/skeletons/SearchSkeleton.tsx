'use client';

import { Skeleton } from '@/components/ui/skeleton';
import SkeletonGrid from './SkeletonGrid';

const SkeletonTab = () => {
  return (
    <div className='flex items-center w-full relative data-[state=active]:text-white text-white/60 transition-colors mx-4'>
      <div className='group text-base font-semibold cursor-pointer relative w-full text-center'>
        <Skeleton className='h-5 w-32 rounded-full mx-auto bg-white/10' />
      </div>
    </div>
  );
};

const SkeletonTabs = () => {
  return (
    <div className='sticky top-0 z-50'>
      <div className='w-full'>
        <div className='flex-between w-full'>
          <div className='relative flex h-14 w-full bg-transparent'>
            <SkeletonTab />
            <SkeletonTab />
            <SkeletonTab />
          </div>
        </div>

        <SkeletonGrid />
      </div>
    </div>
  );
};

export default SkeletonTabs;
