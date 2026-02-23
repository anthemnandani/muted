'use client';

import { api } from '@/trpc/react';
import { useMemo } from 'react';
import ProfilePostsGrid from './ProfilePostsGrid';

const UserLikedPostsList = ({ username }: { username: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.user.getUserLikedPosts.useInfiniteQuery(
      { username },
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

  return (
    <ProfilePostsGrid
      posts={posts}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage ?? false}
      title='No liked posts yet'
      description='Posts you liked will appear here'
      isLoading={isLoading}
      isError={isError}
    />
  );
};

export default UserLikedPostsList;
