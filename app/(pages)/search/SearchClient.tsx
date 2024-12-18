'use client';

import Error from '@/app/error';
import SearchInput from '@/components/inputs/SearchInput';
import UsersList from '@/components/user/UsersList';
import { api } from '@/trpc/react';
import React from 'react';

const SearchClient = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data, isLoading, isRefetching, isError, hasNextPage, fetchNextPage } =
    api.user.allUsers.useInfiniteQuery(
      { searchQuery },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
      }
    );

  const allUsers = data?.pages.flatMap((page) => page.allUsers);

  if (isError) return <Error />;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  return (
    <>
      <SearchInput onSearch={handleSearch} />
      {!searchQuery && (
        <div className='mt-4 text-[#999] dark:text-gray-3 font-semibold text-[15px]'>
          Follow suggestions
        </div>
      )}
      <UsersList
        isLoading={isLoading || isRefetching}
        users={allUsers}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        type='users'
        showDetails={!searchQuery}
      />
    </>
  );
};

export default SearchClient;
