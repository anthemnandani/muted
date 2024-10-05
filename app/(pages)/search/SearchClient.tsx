'use client';

import Error from '@/app/error';
import UserCard from '@/components/cards/UserCard';
import { Icons } from '@/components/icons';
import SearchInput from '@/components/inputs/SearchInput';
import { api } from '@/trpc/react';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loading from '../loading';

const SearchClient = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
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
      <div className='mt-4 text-gray-3 font-semibold text-[15px]'>
        Follow suggestions
      </div>
      {!isLoading && allUsers?.length === 0 && (
        <div className='h-[50vh] w-full flex-center text-gray-3'>
          <p>No users found.</p>
        </div>
      )}
      <div className='mt-4'>
        {isLoading ? (
          <Loading className='md:!h-[80vh]' />
        ) : (
          <InfiniteScroll
            dataLength={allUsers ? allUsers.length : 0}
            next={fetchNextPage}
            hasMore={hasNextPage ?? false}
            loader={
              <div className='h-[100px] w-full flex-center mb-[10vh] sm:mb-0'>
                <Icons.loading className='size-11' />
              </div>
            }
          >
            {allUsers?.map((user) => {
              return <UserCard key={user.id} {...user} />;
            })}
          </InfiniteScroll>
        )}
      </div>
    </>
  );
};

export default SearchClient;
