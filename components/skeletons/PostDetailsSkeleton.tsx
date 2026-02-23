import { Skeleton } from '@/components/ui/skeleton';

const PostDetailsSkeleton = () => {
  return (
    <main className='flex w-full h-screen bg-[#121212] overflow-hidden'>
      <div className='relative flex-[2] h-full flex-center overflow-hidden'>
        <Skeleton className='h-full w-auto aspect-[4/5] bg-white-12 rounded-md' />
      </div>

      <div className='flex-1 h-full min-w-[350px] max-w-[500px] border-l border-zinc-800 bg-[#121212] flex flex-col'>
        <div className='p-5 border-b border-border-light flex flex-col gap-3'>
          <Skeleton className='h-4 w-3/4 bg-white-12 rounded-md' />
          <Skeleton className='h-3 w-1/2 bg-white-12 rounded-md' />
        </div>

        <div className='flex-1 p-5 flex flex-col gap-6 overflow-hidden'>
          {[...Array(9)].map((_, i) => (
            <div key={i} className='flex gap-3'>
              <Skeleton className='size-8 rounded-full bg-white-12 shrink-0' />
              <div className='flex flex-col gap-2 w-full mt-1'>
                <Skeleton className='h-3 w-1/3 bg-white-12 rounded-md' />
                <Skeleton className='h-3 w-[85%] bg-white-12 rounded-md' />
              </div>
            </div>
          ))}
        </div>

        <div className='p-4 border-t border-border-light mt-auto'>
          <Skeleton className='h-10 w-full rounded-full bg-white-12' />
        </div>
      </div>
    </main>
  );
};

export default PostDetailsSkeleton;
