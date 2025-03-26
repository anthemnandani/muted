import { Skeleton } from '../ui/skeleton';

const CommentCardSkeleton = () => {
  return (
    <div className='flex gap-3 p-4 border-b border-border-light'>
      <Skeleton className='size-10 rounded-full flex-shrink-0' />
      <div className='flex-1 space-y-2'>
        <Skeleton className='h-4 w-24' />
        <Skeleton className='h-4 w-4/5' />
        <div className='flex gap-4 pt-1'>
          <Skeleton className='h-3 w-16' />
          <Skeleton className='h-3 w-16' />
        </div>
      </div>
    </div>
  );
};

export default CommentCardSkeleton;
