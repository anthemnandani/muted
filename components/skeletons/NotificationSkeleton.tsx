import { Skeleton } from '@/components/ui/skeleton';

const NotificationSkeleton = () => {
  return (
    <div className='py-2.5 pl-3 pr-4'>
      <div className='flex items-start gap-3'>
        <Skeleton className='size-12 rounded-full flex-shrink-0' />

        <div className='flex-1 space-y-2'>
          <Skeleton className='h-4 w-24' />

          <div className='space-y-1'>
            <Skeleton className='h-3 w-full' />
            <Skeleton className='h-3 w-3/4' />
          </div>
        </div>

        <div className='flex-shrink-0'>
          <Skeleton className='w-12 h-14 rounded-md' />
        </div>
      </div>
    </div>
  );
};

export default NotificationSkeleton;
