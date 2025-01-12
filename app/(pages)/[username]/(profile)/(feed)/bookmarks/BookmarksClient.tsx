'use client';

import NotFound from '@/app/not-found';
import CollectionCard from '@/components/collections/CollectionCard';
import { Icons } from '@/components/icons';
import NewCollection from '@/components/modals/NewCollection';
import Loader from '@/components/shared/Loader';
import { api } from '@/trpc/react';
import InfiniteScroll from 'react-infinite-scroll-component';

const BookmarksClient = ({ username }: { username: string }) => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.collection.getUserCollections.useInfiniteQuery(
      { username, sortBy: 'oldest' },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      }
    );

  const allCollections = data?.pages.flatMap((page) => page.collections);

  if (isLoading) return <Loader />;

  if (isError) return <NotFound />;

  return (
    <div className='px-2 sm:px-4 pt-4 pb-20 md:pb-10'>
      <InfiniteScroll
        dataLength={allCollections?.length ?? 0}
        next={fetchNextPage}
        hasMore={hasNextPage ?? false}
        loader={
          <div className='h-[80px] w-full flex-center mb-[10vh] sm:mb-0'>
            <Icons.loading className='size-11' />
          </div>
        }
      >
        <div className='grid grid-cols-3 gap-2 sm:gap-3 md:gap-4'>
          {allCollections?.map((collection) => (
            <CollectionCard
              key={collection.id}
              collection={collection}
              username={username}
            />
          ))}
        </div>
      </InfiniteScroll>
      {allCollections?.length === 0 && (
        <div className='h-[50vh] w-full flex-center text-gray-3'>
          <p>No collections found</p>
        </div>
      )}
      <NewCollection />
    </div>
  );
};

export default BookmarksClient;
