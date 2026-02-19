'use client';

import Error from '@/app/error';
import PostsList from '@/components/shared/PostsList';
import ScrollContainer from '@/components/shared/ScrollContainer';
import {
  OptimisticActionProvider,
  type TargetType,
} from '@/contexts/OptimisticActionContext';
import { QUERY_TYPE } from '@/lib/constants';
import { api } from '@/trpc/react';
import { useMemo, useRef } from 'react';

const VideoPostsClient = () => {
  const mainContainerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.post.getVideoPosts.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        cacheTime: 10 * 60 * 1000,
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: false,
      },
    );

  const allPosts = data?.pages.flatMap((page) => page.posts);

  const optimisticTarget = useMemo(
    () => ({ type: QUERY_TYPE.VIDEO_FEED, variables: {} }),
    [],
  );

  if (isError) return <Error />;

  return (
    <ScrollContainer ref={mainContainerRef}>
      <OptimisticActionProvider target={optimisticTarget as TargetType}>
        <PostsList
          posts={allPosts}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          emptyStateMessage='No posts found.'
          containerRef={mainContainerRef}
        />
      </OptimisticActionProvider>
    </ScrollContainer>
  );
};

export default VideoPostsClient;
