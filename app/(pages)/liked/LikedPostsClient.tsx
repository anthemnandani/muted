'use client';

import FeedWrapper from '@/components/shared/FeedWrapper';
import { ThreadFilter } from '@/lib/types';
import { api } from '@/trpc/react';

const LikedPostsClient = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.post.getLikedPosts.useInfiniteQuery(
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
      selectedFilter={ThreadFilter.LIKED}
      emptyStateMessage='Posts you like will appear here.'
    />
  );
};

export default LikedPostsClient;
