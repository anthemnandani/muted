import { Skeleton } from '@/components/ui/skeleton';

const UsersSkeleton = () => {
  return (
    <div className='flex flex-col w-full px-4 py-4 mt-4 space-y-4'>
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className='flex items-center w-full py-3 rounded-md'>
          <div className='flex items-start gap-5 w-full'>
            <Skeleton className='size-[60px] rounded-full' />

            <div className='flex flex-col flex-1 gap-[2px]'>
              <Skeleton className='h-6 w-32 mb-1' />

              <div className='flex items-center gap-2 mb-1'>
                <Skeleton className='h-4 w-24' />
                <Skeleton className='size-[2px] rounded-full' />
                <Skeleton className='h-4 w-28' />
              </div>

              <Skeleton className='h-4 w-full max-w-[400px]' />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default UsersSkeleton;
