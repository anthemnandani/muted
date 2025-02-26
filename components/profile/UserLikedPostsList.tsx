'use client';

import { api } from '@/trpc/react';
import React from 'react';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import UserPostsList from './UserPostsList';

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

  if (isLoading)
    return (
      <div className='flex-center min-h-[490px] h-full w-full'>
        <Icons.loading className='size-11' />
      </div>
    );

  if (isError)
    return (
      <EmptyState
        title='Error loading posts'
        description='Please try again later'
      />
    );

  const allPosts = data?.pages.flatMap((page) => page.posts);

  return (
    <UserPostsList
      posts={allPosts}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      likedPosts
    />
  );
};

export default UserLikedPostsList;
