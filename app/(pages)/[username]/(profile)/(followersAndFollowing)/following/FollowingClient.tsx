'use client';

import UsersList from '@/components/user/UsersList';
import useSortBy from '@/store/sortBy';
import { api } from '@/trpc/react';

const FollowingClient = ({ username }: { username: string }) => {
  const { sortBy } = useSortBy();
  const currentSort = sortBy[username] || 'latest';

  const { data, isLoading, isRefetching, hasNextPage, fetchNextPage } =
    api.user.getUserFollowing.useInfiniteQuery(
      { username, sortBy: currentSort },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
      }
    );

  const allFollowing = data?.pages.flatMap((page) => page.following);

  return (
    <div className='px-2 md:px-4'>
      <UsersList
        isLoading={isLoading || isRefetching}
        users={allFollowing}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        type='followings'
      />
    </div>
  );
};

export default FollowingClient;
