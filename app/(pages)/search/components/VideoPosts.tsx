import NotFound from '@/app/not-found';
import SkeletonGrid from '@/components/skeletons/SkeletonGrid';
import usePostStore from '@/store/postStore';
import { useSearchStore } from '@/store/searchStore';
import { api } from '@/trpc/react';
import { useEffect, useMemo } from 'react';
import PostsGrid from './PostsGrid';

const VideoPosts = ({ query }: { query: string }) => {
  const { activeTab } = useSearchStore();
  const { setPostList, setPagination } = usePostStore();
  const { data, isLoading, isFetching, isError, hasNextPage, fetchNextPage } =
    api.search.getVideoPosts.useInfiniteQuery(
      { query },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: activeTab === 'videos',
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: false,
      },
    );

  const videoPosts = useMemo(
    () => data?.pages.flatMap((page) => page.posts) ?? [],
    [data],
  );

  useEffect(() => {
    if (videoPosts.length === 0) return;
    setPostList(videoPosts);
    setPagination(!!hasNextPage, fetchNextPage);
  }, [videoPosts, hasNextPage, fetchNextPage]);

  if (isError) return <NotFound />;

  if (isLoading || isFetching) return <SkeletonGrid />;

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
