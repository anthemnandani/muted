import { Skeleton } from '@/components/ui/skeleton';

const GridSkeleton = ({ count = 9 }: { count?: number }) => (
  <div className='grid grid-cols-3 gap-1'>
    {Array.from({ length: count }).map((_, i) => (
      <Skeleton key={i} className='aspect-square rounded-none bg-white/5' />
    ))}
  </div>
);

export default GridSkeleton;
