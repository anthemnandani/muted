import { Skeleton } from '@/components/ui/skeleton';

export const KeywordSkeleton = () => {
  return (
    <div className='px-2'>
      <div className='flex flex-col w-full h-full bg-white/5 border-b border-b-white/10 rounded-t-lg p-4'>
        <div className='flex-between'>
          <Skeleton className='h-5 w-2/5' />
          <Skeleton className='h-6 w-6 rounded-full' />
        </div>
        <div className='flex items-center mt-2'>
          <Skeleton className='h-4 w-[80px]' />
          <Skeleton className='ml-1 h-4 w-3/5' />
        </div>
      </div>
    </div>
  );
};
