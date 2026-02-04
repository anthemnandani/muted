'use client';

import FeedWrapper from '@/components/shared/FeedWrapper';
import { ThreadFilter } from '@/lib/types';
import { api } from '@/trpc/react';
import { useSearchParams } from 'next/navigation';

const ThreadsClient = () => {
  const searchParams = useSearchParams();
  const tag = searchParams.get('tag');

  const { data, isLoading, isFetching, isError, hasNextPage, fetchNextPage } =
    api.thread.getAllThreads.useInfiniteQuery(
      { searchQuery: tag ?? '' },
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
      isLoading={isLoading || isFetching}
      isError={isError}
      selectedFilter={ThreadFilter.FOR_YOU}
      emptyStateMessage='No threads found.'
    />
  );
};

export default ThreadsClient;
