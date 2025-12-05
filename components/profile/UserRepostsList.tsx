import { api } from '@/trpc/react';
import React from 'react';
import EmptyState from '../shared/EmptyState';
import SkeletonGrid from '../skeletons/SkeletonGrid';
import UserPostsList from './UserPostsList';

const UserRepostsList = ({ username }: { username: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.getUserReposts.useInfiniteQuery(
      { username },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
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

  const allPosts = data?.pages.flatMap((page) => page.posts);
  return isLoading ? (
    <SkeletonGrid />
  ) : (
    <UserPostsList
      posts={allPosts!}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      username={username}
      type='repost'
    />
  );
};

export default UserRepostsList;
