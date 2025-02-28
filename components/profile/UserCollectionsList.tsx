'use client';

import { api } from '@/trpc/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import CollectionCard from '../collections/CollectionCard';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';

const UserCollectionsList = ({ username }: { username: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.collection.getUserCollections.useInfiniteQuery(
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
        title='Error loading collections'
        description='Please try again later'
      />
    );

  const allCollections = data?.pages.flatMap((page) => page.collections);
  return (
    <InfiniteScroll
      dataLength={allCollections.length}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      className='w-full mt-6'
      loader={
        <div className='col-span-full flex-center'>
          <Icons.loading className='size-11' />
        </div>
      }
    >
      <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-[1fr]'>
        {allCollections?.map((collection) => (
          <CollectionCard
            key={collection.id}
            collection={collection}
            username={username}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default UserCollectionsList;
