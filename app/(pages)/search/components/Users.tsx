import Error from '@/app/error';
import { Icons } from '@/components/icons';
import UsersSkeleton from '@/components/skeletons/SearchUsersSkeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Username from '@/components/user/Username';
import { formatCount } from '@/lib/utils';
import { useSearchStore } from '@/store/searchStore';
import { api } from '@/trpc/react';
import Link from 'next/link';
import InfiniteScroll from 'react-infinite-scroll-component';

const Users = ({ query }: { query: string }) => {
  const { activeTab } = useSearchStore();
  const { data, isLoading, isFetching, isError, hasNextPage, fetchNextPage } =
    api.search.getUserResults.useInfiniteQuery(
      { query },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        enabled: activeTab === 'users',
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
      },
    );

  if (isLoading || isFetching) {
    return <UsersSkeleton />;
  }

  if (isError) {
    return <Error />;
  }

  const users = data?.pages.flatMap((page) => page.users);

  if (!users || users.length === 0) {
    return (
      <div className='flex-center p-10'>
        <p className='text-white/70'>No users found</p>
      </div>
    );
  }
  return (
    <InfiniteScroll
      dataLength={users.length}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      className='w-full'
      loader={
        <div className='col-span-full flex-center py-10'>
          <Icons.loading className='size-11' />
        </div>
      }
    >
      <div className='flex flex-col w-full px-4 py-4 mt-4 space-y-4'>
        {users.map((user) => (
          <Link
            href={`/@${user.username}`}
            key={user.id}
            className='flex items-center w-full hover:bg-white/5 py-3 rounded-md transition-colors'
          >
            <div className='flex items-start gap-5 w-full'>
              <Avatar className='size-[60px] rounded-full border border-white/10'>
                <AvatarImage
                  src={user.image ?? ''}
                  alt={user.username ?? ''}
                  className='object-cover'
                />
                <AvatarFallback>
                  {user.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className='flex flex-col flex-1 gap-[2px] overflow-hidden'>
                <Username author={user} className='text-lg font-bold' />
                <div className='flex items-center gap-2'>
                  <h3 className='text-white/75 text-sm truncate'>
                    {user.fullName}
                  </h3>
                  <div className='size-[2px] rounded-full bg-white/75' />
                  <div className='flex items-center text-sm'>
                    <span className='font-semibold text-white/90 mr-1'>
                      {formatCount(user.followers.length || 0)}
                    </span>
                    <span className='text-white/75'>Followers</span>
                  </div>
                </div>
                {user.bio && (
                  <p className='text-white/90 text-sm line-clamp-1 antialiased whitespace-pre-line break-words'>
                    {user.bio}
                  </p>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default Users;
