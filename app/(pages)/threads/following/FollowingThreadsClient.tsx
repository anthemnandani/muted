'use client';

import FeedWrapper from '@/components/shared/FeedWrapper';
import { ThreadFilter } from '@/lib/types';
import { api } from '@/trpc/react';

const FollowingThreadsClient = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.thread.getFollowingThreads.useInfiniteQuery(
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
      selectedFilter={ThreadFilter.FOLLOWING}
      emptyStateMessage='Follow people to see their threads here.'
    />
  );
};

export default FollowingThreadsClient;
