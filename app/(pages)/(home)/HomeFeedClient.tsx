'use client';

import Error from '@/app/error';
import HomeFeedList from '@/components/shared/HomeFeedList';
import HomeFeedScrollContainer from '@/components/shared/HomeFeedScrollContainer';
import {
  OptimisticActionProvider,
  type TargetType,
} from '@/contexts/OptimisticActionContext';
import { QUERY_TYPE } from '@/lib/constants';
import { api } from '@/trpc/react';
import { useEffect, useMemo, useRef, useState } from 'react';

const HomeFeedClient = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
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
        retry: false,
      },
    );

  useEffect(() => {
    const handleRefresh = async () => {
      setIsRefreshing(true);
      mainContainerRef.current?.scrollTo({ top: 0, behavior: 'instant' });
      await refetch();
      setIsRefreshing(false);
    };
    window.addEventListener('refreshFeed', handleRefresh);
    return () => window.removeEventListener('refreshFeed', handleRefresh);
  }, [refetch]);

  const allPosts = data?.pages.flatMap((p) => p.posts);

  const target = useMemo(() => ({ type: QUERY_TYPE.FEED, variables: {} }), []);

  if (isError) return <Error />;

  return (
    <HomeFeedScrollContainer ref={mainContainerRef}>
      <OptimisticActionProvider target={target as TargetType}>
        <HomeFeedList
          posts={allPosts}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading || isRefreshing}
          emptyStateMessage='No posts found.'
        />
      </OptimisticActionProvider>
    </HomeFeedScrollContainer>
  );
};

export default HomeFeedClient;
