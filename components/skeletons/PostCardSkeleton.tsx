import { Skeleton } from '@/components/ui/skeleton';

const PostCardSkeleton = () => {
  return (
    <div className='h-screen flex-center'>
      <article className='flex justify-center items-end gap-4'>
        <div className='w-full max-w-[calc((0px-2rem+100vh)*0.5625)] h-[calc(0px-2rem+100vh)] relative snap-center'>
          <div className='relative h-full w-full overflow-hidden flex-grow'>
            <Skeleton className='h-full w-full aspect-[9/16] rounded-2xl bg-white-12' />
          </div>
        </div>
        <div className='flex flex-col items-center gap-5'>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className='size-12 rounded-full bg-white-12' />
          ))}
        </div>
      </article>
    </div>
  );
};

export default PostCardSkeleton;
