'use client';

import FeedWrapper from '@/components/shared/FeedWrapper';
import { ThreadFilter } from '@/lib/types';
import { api } from '@/trpc/react';

const LikedThreadsClient = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.thread.getLikedThreads.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      },
    );

  const allThreads = data?.pages.flatMap((page) => page.threads);

  return (
    <FeedWrapper
      threads={allThreads!}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isLoading={isLoading}
      isError={isError}
      selectedFilter={ThreadFilter.LIKED}
      emptyStateMessage="You haven't liked any threads yet."
    />
  );
};

export default LikedThreadsClient;
