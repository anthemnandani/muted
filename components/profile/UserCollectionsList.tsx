'use client';

import { api } from '@/trpc/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import CollectionCard from '../collections/CollectionCard';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import SkeletonGrid from '../skeletons/SkeletonGrid';

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
      dataLength={allCollections?.length ?? 0}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      className='w-full '
      loader={
        <div className='col-span-full flex-center'>
          <Icons.loading className='size-11' />
        </div>
      }
    >
      {isLoading ? (
        <SkeletonGrid skeletonClassName='aspect-[4/5]' />
      ) : (
        <div className='main-grid mt-6'>
          {allCollections?.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              username={username}
            />
          ))}
        </div>
      )}
    </InfiniteScroll>
  );
};

export default UserCollectionsList;
