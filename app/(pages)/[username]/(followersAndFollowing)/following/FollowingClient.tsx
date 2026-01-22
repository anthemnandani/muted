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
        cacheTime: 10 * 60 * 1000,
        staleTime: 10 * 60 * 1000,
        retry: false,
      }
    );

  const allFollowing = data?.pages.flatMap((page) => page.following);

  return (
    <main className='flex justify-between w-screen max-w-full flex-auto self-center'>
      <div className='px-2 md:px-4'>
        <UsersList
          isLoading={isLoading || isRefetching}
          users={allFollowing}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          type='followings'
        />
      </div>
    </main>
  );
};

export default FollowingClient;
