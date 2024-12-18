import Loading from '@/app/(pages)/loading';
import SearchQueryOption from '@/app/(pages)/search/components/SearchQueryOption';
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
  showDetails?: boolean;
  searchQuery?: string;
}

const UsersList: React.FC<UsersListProps> = ({
  isLoading,
  users,
  fetchNextPage,
  hasNextPage,
  type,
  showDetails,
  searchQuery,
}) => {
  return (
    <>
      {!isLoading && users?.length === 0 && type !== 'users' && (
        <div className='h-[50vh] w-full flex-center text-gray-3'>
          <p>No {type} found.</p>
        </div>
      )}
      <div>
        {isLoading ? (
          <Loading className='md:!h-[80vh]' />
        ) : (
          <React.Fragment>
            {searchQuery && <SearchQueryOption searchQuery={searchQuery} />}

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
              {users?.map((user, index) => (
                <UserCard
                  key={user.id}
                  {...user}
                  showDetails={showDetails}
                  isLastUser={index === users.length - 1}
                />
              ))}
            </InfiniteScroll>
          </React.Fragment>
        )}
      </div>
    </>
  );
};

export default UsersList;
