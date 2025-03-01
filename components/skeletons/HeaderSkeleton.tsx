import { Skeleton } from '@/components/ui/skeleton';

const HeaderSkeleton = () => {
  return (
    <div className='flex-between h-5'>
      <Skeleton className='size-6 rounded-full' />

      <div className='flex-1 flex justify-center'>
        <Skeleton className='h-4 w-24 rounded-md' />
      </div>
    </div>
  );
};

export default HeaderSkeleton;
