'use client';

import NotFound from '@/app/not-found';
import Loader from '@/components/shared/Loader';
import ThreadsList from '@/components/shared/ThreadsList';
import { api } from '@/trpc/react';

const RepliesClient = ({ username }: { username: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.repliesInfo.useInfiniteQuery(
      { username },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const allReplies = data?.pages.flatMap((page) => page.replies);

  if (isLoading) {
    return <Loader />;
  }

  if (isError) return <NotFound />;

  return (
    <div>
      {allReplies ? (
        allReplies?.length > 0 ? (
          <section className='flex flex-col justify-start w-full'>
            <ThreadsList
              posts={allReplies}
              fetchNextPage={fetchNextPage}
              hasNextPage={hasNextPage}
            />
          </section>
        ) : (
          <div className='h-[50vh] w-full flex-center text-gray-3'>
            <p>No replies yet.</p>
          </div>
        )
      ) : (
        <NotFound />
      )}
    </div>
  );
};

export default RepliesClient;
