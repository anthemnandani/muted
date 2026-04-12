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

const TopicFeedClient = ({ tag }: { tag: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.post.getPostsByTag.useInfiniteQuery(
      { tag },
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
    return { type: QUERY_TYPE.TAG_FEED, variables: { tag } };
  }, [tag]);

  if (isError) return <Error />;

  return (
    <InstaFeedScrollContainer>
      <OptimisticActionProvider target={target as TargetType}>
        <InstaFeedList
          posts={allPosts}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          emptyStateMessage='No posts found.'
          source={ViewSource.HASHTAG_FEED}
        />
      </OptimisticActionProvider>
    </InstaFeedScrollContainer>
  );
};

export default TopicFeedClient;
