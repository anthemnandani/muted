import { Skeleton } from '@/components/ui/skeleton';

const FollowRequestSkeleton = () => {
  return (
    <div className='flex items-start py-2.5 pl-3 pr-4'>
      <Skeleton className='size-12 rounded-full flex-shrink-0' />

      <div className='flex-1 px-3 space-y-2.5'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-3 w-32' />

        <div className='mt-2 flex items-center gap-2'>
          <Skeleton className='h-7 w-24 rounded-md' />
          <Skeleton className='h-7 w-24 rounded-md' />
        </div>
      </div>
    </div>
  );
};

export default FollowRequestSkeleton;
