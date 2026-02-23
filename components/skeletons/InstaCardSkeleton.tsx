import { Skeleton } from '@/components/ui/skeleton';

const InstaCardSkeleton = () => {
  return (
    <article className='border-b border-border-light w-full'>
      <div className='flex items-center gap-2.5 px-3 py-2.5'>
        <Skeleton className='size-8 rounded-full bg-white-12' />
        <Skeleton className='flex-1 h-4 w-full max-w-[50%] rounded bg-white-12' />
      </div>

      <Skeleton className='w-full aspect-[4/5] sm:aspect-square bg-white-12 rounded-none' />

      <div className='px-3 mt-3 mb-4'>
        <div className='mb-2.5 flex flex-col gap-2.5'>
          <Skeleton className='h-4 w-[85%] rounded bg-white-12' />
          <Skeleton className='h-4 w-[60%] rounded bg-white-12' />
        </div>
      </div>
    </article>
  );
};

export default InstaCardSkeleton;
