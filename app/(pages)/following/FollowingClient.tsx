'use client';

import Error from '@/app/error';
import PostsList from '@/components/shared/PostsList';
import ScrollContainer from '@/components/shared/ScrollContainer';
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

  if (isError) return <Error />;

  return (
    <ScrollContainer>
      <PostsList
        posts={allPosts}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoading={isLoading}
        emptyStateMessage='Follow more profiles to get your feed going.'
      />
    </ScrollContainer>
  );
};

export default FollowingClient;
