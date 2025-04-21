'use client';

import Error from '@/app/error';
import PostsList from '@/components/shared/PostsList';
import ScrollContainer from '@/components/shared/ScrollContainer';
import { api } from '@/trpc/react';
import { useEffect, useState } from 'react';

const PostsClient = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data, isLoading, isError, hasNextPage, fetchNextPage, refetch } =
    api.post.getInfinitePosts.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  useEffect(() => {
    const handleRefresh = async () => {
      setIsRefreshing(true);
      await refetch();
      setIsRefreshing(false);
    };

    window.addEventListener('refreshFeed', handleRefresh);

    return () => {
      window.removeEventListener('refreshFeed', handleRefresh);
    };
  }, [refetch]);

  const allPosts = data?.pages.flatMap((page) => page.posts);

  if (isError) return <Error />;

  return (
    <ScrollContainer>
      <PostsList
        posts={allPosts}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoading={isLoading || isRefreshing}
        emptyStateMessage='No posts found.'
      />
    </ScrollContainer>
  );
};

export default PostsClient;
