'use client';

import Error from '@/app/error';
import BlockedUserCard from '@/components/cards/BlockedUserCard';
import { Icons } from '@/components/icons';
import { BlockListProps } from '@/lib/types';
import InfiniteScroll from 'react-infinite-scroll-component';

const BlockList = ({
  allBlockedUsers,
  isError,
  hasNextPage,
  fetchNextPage,
}: BlockListProps) => {
  if (isError) return <Error hideButton />;

  return (
    <div className='h-full p-2'>
      <h2 className='text-2xl font-bold'>Blocked accounts</h2>
      <InfiniteScroll
        dataLength={allBlockedUsers?.length ?? 0}
        next={fetchNextPage}
        hasMore={hasNextPage}
        loader={
          <div className='w-full flex-center py-4'>
            <Icons.loading className='size-8' />
          </div>
        }
        scrollableTarget='scrollableDiv'
        className='pt-6 w-full'
      >
        {allBlockedUsers?.length === 0 ? (
          <p className='text-center text-gray-400 py-8'>
            No blocked accounts yet
          </p>
        ) : (
          allBlockedUsers?.map((blockedUser) => (
            <BlockedUserCard key={blockedUser.id} blockedUser={blockedUser} />
          ))
        )}
      </InfiniteScroll>
    </div>
  );
};

export default BlockList;
