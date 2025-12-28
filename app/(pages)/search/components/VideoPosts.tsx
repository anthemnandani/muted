import NotFound from '@/app/not-found';
import SkeletonGrid from '@/components/skeletons/SkeletonGrid';
import { useSearchStore } from '@/store/searchStore';
import { api } from '@/trpc/react';
import React from 'react';
import PostsGrid from './PostsGrid';

const VideoPosts = ({ query }: { query: string }) => {
  const { activeTab } = useSearchStore();
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

  if (!videoPosts || videoPosts.length === 0) {
    return (
      <div className='flex-center p-10'>
        <p className='text-white/70'>No posts found</p>
      </div>
    );
  }

  return (
    <PostsGrid
      posts={videoPosts}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      query={query}
    />
  );
};

export default VideoPosts;
