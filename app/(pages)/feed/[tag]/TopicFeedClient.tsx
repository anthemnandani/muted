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
      }
    );

  const allPosts = data?.pages.flatMap((page) => page.posts);

  const target = useMemo(() => {
    return { type: QUERY_TYPE.TAG_FEED, variables: { tag } };
  }, [tag]);

  if (isError) return <Error />;

  return (
    <ScrollContainer>
      <OptimisticLikeProvider target={target as TargetType}>
        <PostsList
          posts={allPosts}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isLoading={isLoading}
          emptyStateMessage='No posts found.'
        />
      </OptimisticLikeProvider>
    </ScrollContainer>
  );
};

export default TopicFeedClient;
