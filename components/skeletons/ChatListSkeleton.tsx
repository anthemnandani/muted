import { Skeleton } from '../ui/skeleton';

const ChatListSkeleton = () => {
  return (
    <div className='p-4'>
      <div className='space-y-3'>
        {[...Array(10)].map((_, i) => (
          <div key={i} className='flex items-center space-x-3'>
            <Skeleton className='size-12 rounded-full' />
            <div className='flex-1'>
              <Skeleton className='h-4 rounded w-3/4 mb-2' />
              <Skeleton className='h-3 rounded w-1/2' />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChatListSkeleton;
