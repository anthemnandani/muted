import SearchQueryOption from '@/app/(pages)/search/components/SearchQueryOption';
import UserCard from '@/components/cards/UserCard';
import { Icons } from '@/components/icons';
import { UsersListProps } from '@/lib/types';
import { Fragment } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import Loader from '../shared/Loader';

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
    <Fragment>
      {!isLoading && users?.length === 0 && type !== 'users' && (
        <div className='h-[50vh] w-full flex-center text-gray-3'>
          <p>No {type} found.</p>
        </div>
      )}
      <div>
        {isLoading ? (
          <Loader className='md:!h-[80vh]' />
        ) : (
          <Fragment>
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
          </Fragment>
        )}
      </div>
    </Fragment>
  );
};

export default UsersList;
