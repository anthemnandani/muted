'use client';

import Error from '@/app/error';
import FeedWrapper from '@/components/shared/FeedWrapper';
import { ThreadFilter } from '@/lib/types';
import { api } from '@/trpc/react';
import Loading from '../loading';

const ThreadsClient = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.post.getInfinitePosts.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const allPosts = data?.pages.flatMap((page) => page.posts);

  if (isLoading) return <Loading />;
  if (isError) return <Error />;

  return (
    <FeedWrapper
      posts={allPosts}
      isLoading={isLoading}
      isError={isError}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      selectedFilter={ThreadFilter.FOR_YOU}
      emptyStateMessage='No posts found.'
    />
  );
};

export default ThreadsClient;
