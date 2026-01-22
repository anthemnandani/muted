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
        cacheTime: 10 * 60 * 1000,
        staleTime: 10 * 60 * 1000,
        retry: false,
      }
    );

  const allFollowers = data?.pages.flatMap((page) => page.followers);

  return (
    <main className='flex justify-between w-screen max-w-full flex-auto self-center'>
      <div className='px-2 md:px-4'>
        <UsersList
          isLoading={isLoading || isRefetching}
          users={allFollowers}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          type='followers'
        />
      </div>
    </main>
  );
};

export default FollowersClient;
