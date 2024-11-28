'use client';

import FeedWrapper from '@/components/shared/FeedWrapper';
import { api } from '@/trpc/react';

const TopicFeedClient = ({ tag }: { tag: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.post.getPostsByTag.useInfiniteQuery(
      { tag },
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
      emptyStateMessage={
        <>
          No posts found for the tag{' '}
          <span className='font-bold text-primary-blue'>{tag}</span>.
        </>
      }
    />
  );
};

export default TopicFeedClient;
