'use client';
import NotFound from '@/app/not-found';
import Loader from '@/components/shared/Loader';
import ThreadsList from '@/components/shared/ThreadsList';
import { api } from '@/trpc/react';

const RepostsClient = ({ username }: { username: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.repostsInfo.useInfiniteQuery(
      { username },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  if (isLoading) return <Loader />;

  if (isError) return <NotFound />;

  const allReposts = data?.pages.flatMap((page) => page.reposts);

  return (
    <div>
      {allReposts ? (
        allReposts?.length > 0 ? (
          <section className='flex flex-col justify-start w-full'>
            <ThreadsList
              posts={allReposts}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
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
