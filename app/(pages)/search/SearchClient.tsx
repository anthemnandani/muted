'use client';

import Error from '@/app/error';
import SearchInput from '@/components/inputs/SearchInput';
import HeaderWrapper from '@/components/shared/HeaderWrapper';
import PostsList from '@/components/shared/PostsList';
import TopHeader from '@/components/shared/TopHeader';
import Wrapper from '@/components/shared/Wrapper';
import UsersList from '@/components/user/UsersList';
import useWindow from '@/hooks/useWindow';
import { api } from '@/trpc/react';
import { useSearchParams } from 'next/navigation';
import React from 'react';
import SortButtons from './components/SortButtons';

const SearchClient = () => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortBy, setSortBy] = React.useState<'TOP' | 'LATEST'>('TOP');
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const { isMobile } = useWindow();

  const { data, isLoading, isRefetching, isError, hasNextPage, fetchNextPage } =
    api.user.allUsers.useInfiniteQuery(
      { searchQuery },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
      }
    );

  const {
    data: postsData,
    isLoading: isPostsLoading,
    isRefetching: isPostsRefetching,
    isError: isPostsError,
    hasNextPage: postsHasNextPage,
    fetchNextPage: postsFetchNextPage,
  } = api.post.getInfinitePosts.useInfiniteQuery(
    { searchQuery: query ?? '', sortBy },
    {
      enabled: !!query,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      trpc: { abortOnUnmount: true },
      staleTime: 10 * 60 * 1000,
    }
  );

  const allPosts = postsData?.pages.flatMap((page) => page.posts);
  const allUsers = data?.pages.flatMap((page) => page.allUsers);

  if (isError || isPostsError) return <Error />;

  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleSortChange = (newSort: 'TOP' | 'LATEST') => {
    setSortBy(newSort);
  };

  return (
    <>
      {!isMobile && (
        <HeaderWrapper>
          <TopHeader
            title={query ?? 'Search'}
            onBack={() => setSearchQuery('')}
          />
        </HeaderWrapper>
      )}

      <Wrapper>
        <div className='max-w-xl mx-auto w-full mt-[18px]'>
          {query ? (
            <section className='flex flex-col gap-4 justify-start w-full'>
              <SortButtons sortBy={sortBy} onSortChange={handleSortChange} />
              <PostsList
                posts={allPosts}
                fetchNextPage={postsFetchNextPage}
                hasNextPage={postsHasNextPage}
                isLoading={isPostsLoading || isPostsRefetching}
              />
            </section>
          ) : (
            <div className='pl-2 md:pl-4'>
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
                searchQuery={searchQuery}
              />
            </div>
          )}
        </div>
      </Wrapper>
    </>
  );
};

export default SearchClient;
