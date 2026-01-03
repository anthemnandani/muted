'use client';

import Error from '@/app/error';
import PostsList from '@/components/shared/PostsList';
import ScrollContainer from '@/components/shared/ScrollContainer';
import {
  OptimisticLikeProvider,
  type TargetType,
} from '@/contexts/OptimisticLikeContext';
import { QUERY_TYPE } from '@/lib/constants';
import { api } from '@/trpc/react';
import { useEffect, useMemo, useRef, useState } from 'react';

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
        refetchOnWindowFocus: false,
        // retry: false,
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

  const optimisticTarget = useMemo(
    () => ({ type: QUERY_TYPE.FEED, variables: {} }),
    []
  );

  if (isError) return <Error />;

  return (
    <main className='content-center min-w-[420px]'>
      <ScrollContainer ref={mainContainerRef}>
        <OptimisticLikeProvider target={optimisticTarget as TargetType}>
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
        </OptimisticLikeProvider>
      </ScrollContainer>
    </main>
  );
};

export default PostsClient;
