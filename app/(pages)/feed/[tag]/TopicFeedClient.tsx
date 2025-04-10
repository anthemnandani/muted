'use client';

import Error from '@/app/error';
import PostsList from '@/components/shared/PostsList';
import ScrollContainer from '@/components/shared/ScrollContainer';
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

  if (isError) return <Error />;

  return (
    <ScrollContainer>
      <PostsList
        posts={allPosts}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        emptyStateMessage='No posts found.'
      />
    </ScrollContainer>
  );
};

export default TopicFeedClient;
