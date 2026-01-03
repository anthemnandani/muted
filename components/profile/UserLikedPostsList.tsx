'use client';

import usePostStore from '@/store/postStore';
import { api } from '@/trpc/react';
import { useEffect, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import SkeletonGrid from '../skeletons/SkeletonGrid';
import UserPostCard from './UserPostCard';

const UserLikedPostsList = ({ username }: { username: string }) => {
  const { setPostList, setPagination } = usePostStore();

  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.getUserLikedPosts.useInfiniteQuery(
      { username },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        cacheTime: 10 * 60 * 1000,
        retry: false,
      }
    );

  if (isError)
    return (
      <EmptyState
        title='Error loading posts'
        description='Please try again later'
      />
    );

  const posts = data?.pages.flatMap((page) => page.posts);

  const postsHash = useMemo(() => {
    return posts?.map((p) => `${p.id}-${p.likesCount}`).join('|');
  }, [posts]);

  useEffect(() => {
    if (!posts) return;
    setPostList(posts);
    setPagination(!!hasNextPage, fetchNextPage);
  }, [postsHash, hasNextPage, fetchNextPage]);

  if (isLoading) return <SkeletonGrid />;

  return posts?.length === 0 ? (
    <EmptyState
      icon={
        <div className='size-[92px] rounded-full flex-center bg-zinc-800'>
          <Icons.emptyPost className='size-11 text-white/90' />
        </div>
      }
      title='No liked posts yet'
      description='Posts you liked will appear here'
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
            index={index}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default UserLikedPostsList;
