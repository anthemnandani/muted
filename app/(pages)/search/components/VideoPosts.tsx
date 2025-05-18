import NotFound from '@/app/not-found';
import SkeletonGrid from '@/components/skeletons/SkeletonGrid';
import { useSearchTabStore } from '@/store/searchTabs';
import { api } from '@/trpc/react';
import React from 'react';
import PostsGrid from './PostsGrid';

const VideoPosts = ({ query }: { query: string }) => {
  const { activeTab } = useSearchTabStore();
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.search.getVideoPosts.useInfiniteQuery(
      { query },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: activeTab === 'videos',
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  if (isError) return <NotFound />;

  if (isLoading) return <SkeletonGrid />;

  const videoPosts = data?.pages.flatMap((page) => page.posts);

  return (
    <PostsGrid
      posts={videoPosts}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
    />
  );
};

export default VideoPosts;
