'use client';

import Error from '@/app/error';
import InstaFeedList from '@/components/shared/InstaFeedList';
import InstaFeedScrollContainer from '@/components/shared/InstaFeedScrollContainer';
import {
  OptimisticActionProvider,
  type TargetType,
} from '@/contexts/OptimisticActionContext';
import { ViewSource } from '@/generated/prisma/enums';
import { QUERY_TYPE } from '@/lib/constants';
import { api } from '@/trpc/react';
import { useMemo } from 'react';

const FollowingClient = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.post.getFollowingPosts.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: false,
      },
    );

  const allPosts = data?.pages.flatMap((page) => page.posts);

  const target = useMemo(() => {
    return { type: QUERY_TYPE.FOLLOWING_FEED, variables: {} };
  }, []);

  if (isError) return <Error />;

  return (
    <InstaFeedScrollContainer>
      <OptimisticActionProvider target={target as TargetType}>
        <InstaFeedList
          posts={allPosts}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          emptyStateMessage='Follow more profiles to get your feed going.'
          source={ViewSource.FOLLOWING_FEED}
        />
      </OptimisticActionProvider>
    </InstaFeedScrollContainer>
  );
};

export default FollowingClient;
