import { Skeleton } from '../ui/skeleton';

const AdminDashboardSkeleton = () => {
  return (
    <div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
      <div className='grid auto-rows-min gap-4 md:grid-cols-4 px-4 lg:px-6'>
        <Skeleton className='h-[88px]' />
        <Skeleton className='h-[88px]' />
        <Skeleton className='h-[88px]' />
        <Skeleton className='h-[88px]' />
      </div>
      <div className='grid grid-cols-1 gap-4 px-4 lg:grid-cols-2 lg:px-6'>
        <Skeleton className='h-[350px]' />
        <Skeleton className='h-[350px]' />
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;
