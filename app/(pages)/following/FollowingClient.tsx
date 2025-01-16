'use client';

import FeedWrapper from '@/components/shared/FeedWrapper';
import { ThreadFilter } from '@/lib/types';
import { api } from '@/trpc/react';

const FollowingClient = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.post.getFollowingPosts.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const allPosts = data?.pages.flatMap((page) => page.posts);

  return (
    <FeedWrapper
      posts={allPosts}
      isLoading={isLoading}
      isError={isError}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      selectedFilter={ThreadFilter.FOLLOWING}
      emptyStateMessage='Follow more profiles to get your feed going.'
    />
  );
};

export default FollowingClient;
