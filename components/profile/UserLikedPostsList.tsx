'use client';

import { api } from '@/trpc/react';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import UserPostsList from './UserPostsList';
import SkeletonGrid from '../skeletons/SkeletonGrid';

const UserLikedPostsList = ({ username }: { username: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.getUserLikedPosts.useInfiniteQuery(
      { username },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
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
      likedPosts
    />
  );
};

export default UserLikedPostsList;
