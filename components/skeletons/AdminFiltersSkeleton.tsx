import { Skeleton } from '@/components/ui/skeleton';

const AdminFiltersSkeleton = () => {
  return (
    <div className='rounded-lg border p-4'>
      <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
        <div className='flex flex-1 items-center gap-2'>
          <Skeleton className='h-10 w-full md:max-w-sm' />
        </div>

        <div className='flex flex-wrap items-center gap-2'>
          <Skeleton className='h-10 w-[150px]' />
          <Skeleton className='h-10 w-[150px]' />
          <Skeleton className='h-9 w-[70px]' />
        </div>
      </div>
    </div>
  );
};

export default AdminFiltersSkeleton;
