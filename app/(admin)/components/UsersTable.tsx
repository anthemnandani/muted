'use client';

import UserAvatar from '@/components/shared/UserAvatar';
import AdminUsersTableSkeleton from '@/components/skeletons/AdminUsersTableSkeleton';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useDebounce from '@/hooks/useDebounce';
import {
  cn,
  formatCount,
  getStrikeBadgeClass,
  getUserStatusInfo,
} from '@/lib/utils';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import { api } from '@/trpc/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import TableLoader from './TableLoader';
import UserActions from './UserActions';

const UsersTable = () => {
  const { userSearch, userStatus } = useAdminFiltersStore();

  const debouncedSearch = useDebounce(userSearch, 500);

  const { data, isLoading, hasNextPage, fetchNextPage } =
    api.admin.getAllUsers.useInfiniteQuery(
      { search: debouncedSearch, status: userStatus },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        refetchOnWindowFocus: false,
      }
    );

  const users = data?.pages.flatMap((page) => page.users);

  if (isLoading) {
    return <AdminUsersTableSkeleton />;
  }

  return (
    <div
      className='relative h-[75vh] rounded-lg border overflow-y-auto'
      id='scrollableTableContainer'
    >
      <InfiniteScroll
        dataLength={users?.length ?? 0}
        next={fetchNextPage}
        hasMore={hasNextPage ?? false}
        scrollableTarget='scrollableTableContainer'
        loader={<TableLoader />}
      >
        <Table>
          <TableHeader className='sticky top-0 z-10 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/40'>
            <TableRow>
              <TableHead className='w-[20%] pl-6'>User</TableHead>
              <TableHead className='w-[20%]'>Email</TableHead>
              <TableHead>Posts</TableHead>
              <TableHead>Followers</TableHead>
              <TableHead>Strikes</TableHead>
              <TableHead className='w-[15%]'>Date Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className='text-center pr-6'>Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {!isLoading && users?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className='py-10 text-center text-sm text-muted-foreground'
                >
                  No user matches your filters.
                </TableCell>
              </TableRow>
            ) : (
              users?.map((user) => {
                const strikes = 3;
                const statusInfo = getUserStatusInfo(user.status);
                return (
                  <TableRow
                    key={user.id}
                    className='bg-transparent hover:bg-muted/30'
                  >
                    <TableCell className='py-5 pl-6'>
                      <UserAvatar
                        username={user.username}
                        fullname={user?.fullName}
                        image={user.image}
                        showInfo
                      />
                    </TableCell>

                    <TableCell>
                      <div
                        className='truncate text-sm text-white/65'
                        title={user.email ?? ''}
                      >
                        {user.email}
                      </div>
                    </TableCell>

                    <TableCell className='text-sm font-medium text-white/65'>
                      {formatCount(user._count.posts)}
                    </TableCell>

                    <TableCell className='text-sm font-medium text-white/65'>
                      {formatCount(user._count.followers)}
                    </TableCell>

                    <TableCell>
                      <Badge
                        className={cn(
                          getStrikeBadgeClass(strikes),
                          'text-[13px] px-2 py-[1px]'
                        )}
                      >
                        {strikes}
                      </Badge>
                    </TableCell>

                    <TableCell className='text-sm text-white/65'>
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </TableCell>

                    <TableCell>
                      <Badge className={statusInfo.className}>
                        {statusInfo.text}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <UserActions id={user.id} username={user.username} />
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </InfiniteScroll>
    </div>
  );
};

export default UsersTable;
