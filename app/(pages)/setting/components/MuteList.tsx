'use client';

import Error from '@/app/error';
import MutedUserCard from '@/components/cards/MutedUserCard';
import { Icons } from '@/components/icons';
import { MuteListProps } from '@/lib/types';
import InfiniteScroll from 'react-infinite-scroll-component';

const MuteList = ({
  allMutedUsers,
  isError,
  hasNextPage,
  fetchNextPage,
}: MuteListProps) => {
  if (isError) return <Error hideButton />;

  return (
    <div className='h-full p-2'>
      <h2 className='text-2xl font-bold'>Muted accounts</h2>
      <InfiniteScroll
        dataLength={allMutedUsers?.length ?? 0}
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
        {allMutedUsers?.length === 0 ? (
          <p className='text-center text-gray-400 py-8'>
            No muted accounts yet
          </p>
        ) : (
          allMutedUsers?.map((mutedUser) => (
            <MutedUserCard key={mutedUser.id} mutedUser={mutedUser} />
          ))
        )}
      </InfiniteScroll>
    </div>
  );
};

export default MuteList;
