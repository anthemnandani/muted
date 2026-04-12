import { Skeleton } from '@/components/ui/skeleton';

const ThreadListSkeleton = ({ count = 6 }: { count?: number }) => (
  <div className='space-y-4 px-2'>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className='rounded-[25px] bg-white/[0.03] border border-white/[0.06] p-4'
      >
        <div className='flex items-center gap-3 mb-3'>
          <Skeleton className='size-10 rounded-full bg-white/5' />
          <div className='flex-1'>
            <Skeleton className='h-3 w-24 bg-white/5 mb-1.5' />
            <Skeleton className='h-2.5 w-16 bg-white/[0.03]' />
          </div>
        </div>
        <Skeleton className='h-4 w-full bg-white/[0.03] mb-2' />
        <Skeleton className='h-4 w-3/4 bg-white/[0.03]' />
      </div>
    ))}
  </div>
);

export default ThreadListSkeleton;
