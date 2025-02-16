'use client';
import NotFound from '@/app/not-found';
import Loader from '@/components/shared/Loader';
import PostsList from '@/components/shared/PostsList';
import { useSyncPostStates } from '@/hooks/useSyncPostStates';
import { api } from '@/trpc/react';
import React from 'react';

const RepostsClient = ({ username }: { username: string }) => {
  const { syncMultiplePosts } = useSyncPostStates();
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.repostsInfo.useInfiniteQuery(
      { username },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const allReposts = data?.pages.flatMap((page) => page.reposts);

  React.useEffect(() => {
    if (!allReposts?.length) return;
    syncMultiplePosts(allReposts);
  }, [data]);

  if (isLoading) return <Loader />;

  if (isError) return <NotFound />;

  return (
    <div>
      {allReposts ? (
        allReposts?.length > 0 ? (
          <section className='flex flex-col justify-start w-full'>
            <PostsList
              posts={allReposts}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
              showMuted={false}
            />
          </section>
        ) : (
          <div className='h-[50vh] w-full flex-center text-gray-3'>
            <p>No reposts yet.</p>
          </div>
        )
      ) : (
        <NotFound />
      )}
    </div>
  );
};

export default RepostsClient;
