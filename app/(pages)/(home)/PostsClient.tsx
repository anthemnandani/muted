'use client';

import Error from '@/app/error';
import PostsList from '@/components/shared/PostsList';
import ScrollContainer from '@/components/shared/ScrollContainer';
import { api } from '@/trpc/react';
import { useEffect, useRef, useState } from 'react';

const PostsClient = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [resetToFirst, setResetToFirst] = useState(false);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, hasNextPage, fetchNextPage, refetch } =
    api.post.getInfinitePosts.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 0,
        cacheTime: 0,
        refetchOnMount: 'always',
      }
    );

  useEffect(() => {
    const handleRefresh = async (event: Event) => {
      const customEvent = event as CustomEvent;
      setIsRefreshing(true);

      if (customEvent.detail?.resetToFirstPost) {
        setResetToFirst(true);
      }

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
    <ScrollContainer ref={mainContainerRef}>
      <PostsList
        posts={allPosts}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isLoading={isLoading || isRefreshing}
        emptyStateMessage='No posts found.'
        resetToFirst={resetToFirst}
        onResetComplete={() => setResetToFirst(false)}
        containerRef={mainContainerRef}
      />
    </ScrollContainer>
  );
};

export default PostsClient;
