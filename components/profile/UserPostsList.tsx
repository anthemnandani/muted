import type { ProfileFilter } from '@/lib/types';
import usePostStore from '@/store/postStore';
import { api } from '@/trpc/react';
import { useEffect, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import SkeletonGrid from '../skeletons/SkeletonGrid';
import UserPostCard from './UserPostCard';

const UserPostsList = ({
  username,
  filter,
}: {
  username: string;
  filter: ProfileFilter;
}) => {
  const { setPostList, setPagination } = usePostStore();

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.getUserPosts.useInfiniteQuery(
      { username, sortBy: filter },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: false,
      },
    );

  const posts = useMemo(() => {
    return data?.pages.flatMap((page) => page.posts) ?? [];
  }, [data]);

  useEffect(() => {
    if (posts.length === 0) return;

    setPostList(posts);
    setPagination(!!hasNextPage, fetchNextPage);
  }, [posts, hasNextPage, fetchNextPage]);

  if (isLoading) return <SkeletonGrid />;

  if (isError)
    return (
      <EmptyState
        title='Error loading posts'
        description='Please try again later'
      />
    );

  return posts?.length === 0 ? (
    <EmptyState
      icon={
        <div className='size-[92px] rounded-full flex-center bg-zinc-800'>
          <Icons.emptyPost className='size-11 text-white/90' />
        </div>
      }
      title='Upload your first post'
      description='Upload your first post'
    />
  ) : (
    <InfiniteScroll
      dataLength={posts?.length ?? 0}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      className='w-full mt-6'
      loader={
        <div className='col-span-full flex-center py-10'>
          <Icons.loading className='size-11' />
        </div>
      }
    >
      <div className='main-grid'>
        {posts?.map((post, index) => (
          <UserPostCard
            key={post.id}
            media={post.media}
            postId={post.id}
            pinned={post.pinned}
            index={index}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default UserPostsList;
