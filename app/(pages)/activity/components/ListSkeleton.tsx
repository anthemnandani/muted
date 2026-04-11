import { Skeleton } from '@/components/ui/skeleton';

const ListSkeleton = ({ count = 8 }: { count?: number }) => (
  <div className='space-y-0'>
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className='flex items-start gap-3 py-3.5 px-3'>
        <Skeleton className='size-8 rounded-full bg-white/5 flex-shrink-0' />
        <div className='flex-1'>
          <Skeleton className='h-3 w-24 bg-white/5 mb-2' />
          <Skeleton className='h-3.5 w-full bg-white/[0.03] mb-1.5' />
          <Skeleton className='h-3.5 w-2/3 bg-white/[0.03]' />
        </div>
      </div>
    ))}
  </div>
);

export default ListSkeleton;
