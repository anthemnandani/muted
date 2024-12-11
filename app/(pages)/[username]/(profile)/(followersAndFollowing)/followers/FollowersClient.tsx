'use client';

import UsersList from '@/components/user/UsersList';
import useSortBy from '@/store/sortBy';
import { api } from '@/trpc/react';

const FollowersClient = ({ username }: { username: string }) => {
  const { sortBy } = useSortBy();
  const currentSort = sortBy[username] || 'latest';
  const { data, isLoading, isRefetching, hasNextPage, fetchNextPage } =
    api.user.getUserFollowers.useInfiniteQuery(
      { username, sortBy: currentSort },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
      }
    );

  const allFollowers = data?.pages.flatMap((page) => page.followers);

  return (
    <UsersList
      isLoading={isLoading || isRefetching}
      users={allFollowers}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      type='followers'
    />
  );
};

export default FollowersClient;
