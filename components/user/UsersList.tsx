import Loading from '@/app/(pages)/loading';
import UserCard from '@/components/cards/UserCard';
import { Icons } from '@/components/icons';
import { AuthorInfoProps } from '@/lib/types';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

interface UsersListProps {
  isLoading: boolean;
  users?: AuthorInfoProps[];
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  type: 'users' | 'followings' | 'followers';
}

const UsersList: React.FC<UsersListProps> = ({
  isLoading,
  users,
  fetchNextPage,
  hasNextPage,
  type,
}) => {
  return (
    <>
      {!isLoading && users?.length === 0 && (
        <div className='h-[50vh] w-full flex-center text-gray-3'>
          <p>No {type} found.</p>
        </div>
      )}
      <div className='mt-4'>
        {isLoading ? (
          <Loading className='md:!h-[80vh]' />
        ) : (
          <InfiniteScroll
            dataLength={users?.length ?? 0}
            next={fetchNextPage}
            hasMore={hasNextPage ?? false}
            loader={
              <div className='h-[100px] w-full flex-center mb-[10vh] sm:mb-0'>
                <Icons.loading className='size-11' />
              </div>
            }
          >
            {users?.map((user) => (
              <UserCard key={user.id} {...user} />
            ))}
          </InfiniteScroll>
        )}
      </div>
    </>
  );
};

export default UsersList;
