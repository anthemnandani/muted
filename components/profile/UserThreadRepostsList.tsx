import { api } from '@/trpc/react';
import { useMemo } from 'react';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import ThreadsList from '../shared/ThreadsList';
import Wrapper from '../shared/Wrapper';

const UserThreadRepostsList = ({ username }: { username: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.thread.getUserThreadReposts.useInfiniteQuery(
      { username },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: false,
      },
    );

  if (isError)
    return (
      <EmptyState
        title='Error loading reposts'
        description='Please try again later'
      />
    );

  const reposts = useMemo(() => {
    return data?.pages.flatMap((page) => page.reposts) ?? [];
  }, [data]);

  if (isLoading) {
    return (
      <div className='flex justify-center h-[300px]'>
        <Icons.loading className='size-10 animate-spin' />
      </div>
    );
  }

  return reposts?.length === 0 ? (
    <EmptyState
      icon={
        <div className='size-[92px] rounded-full flex-center bg-zinc-800'>
          <Icons.threads className='size-11 text-white/90' />
        </div>
      }
      title='No reposts yet'
      description='Threads you repost will appear here.'
    />
  ) : (
    <Wrapper>
      <div className='flex flex-col gap-4 w-full'>
        <ThreadsList
          threads={reposts!}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
        />
      </div>
    </Wrapper>
  );
};

export default UserThreadRepostsList;
