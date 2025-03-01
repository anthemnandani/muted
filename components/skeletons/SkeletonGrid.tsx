import { Skeleton } from '@/components/ui/skeleton';
import { SkeletonGridProps } from '@/lib/types';

const SkeletonGrid = ({
  count = 8,
  className = '',
  skeletonClassName = 'aspect-[3/4]',
}: SkeletonGridProps) => {
  return (
    <div className={`main-grid mt-6 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton
          key={index}
          className={`rounded-[4px] ${skeletonClassName}`}
        />
      ))}
    </div>
  );
};

export default SkeletonGrid;
