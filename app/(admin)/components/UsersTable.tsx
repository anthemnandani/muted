'use client';

import UserAvatar from '@/components/shared/UserAvatar';
import AdminUsersTableSkeleton from '@/components/skeletons/AdminUsersTableSkeleton';
import { Badge } from '@/components/ui/badge';
import {
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Role, UserStatus } from '@/generated/prisma/enums';
import useDebounce from '@/hooks/useDebounce';
import type { AdminUser } from '@/lib/types';
import {
  cn,
  formatCount,
  formatStrikesDisplay,
  getStrikeBadgeClass,
  getUserStatusInfo,
} from '@/lib/utils';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import { api } from '@/trpc/react';
import AdminItemsTable from './AdminItemsTable';
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
        cacheTime: 10 * 60 * 1000,
        staleTime: 10 * 60 * 1000,
        retry: false,
      },
    );

  const users = data?.pages.flatMap((page) => page.users);

  const tableHeader = (
    <TableHeader className='sticky top-0 z-10 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/40'>
      <TableRow>
        <TableHead className='w-[20%] pl-6'>User</TableHead>
        <TableHead className='w-[20%]'>Email</TableHead>
        <TableHead>Posts</TableHead>
        <TableHead>Followers</TableHead>
        <TableHead>Strikes</TableHead>
        <TableHead className='w-[13%]'>Date Created</TableHead>
        <TableHead>Role</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className='w-[15%] text-center'>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  const renderRow = (user: AdminUser) => {
    const statusInfo = getUserStatusInfo(user.status);
    return (
      <TableRow key={user.id} className='bg-transparent hover:bg-muted/30'>
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

        <TableCell className='text-sm font-medium text-white/65 pl-5'>
          {formatCount(user.postsCount)}
        </TableCell>

        <TableCell className='text-sm font-medium text-white/65 pl-8'>
          {formatCount(user.followersCount)}
        </TableCell>

        <TableCell className='pl-3'>
          <Badge
            className={cn(
              getStrikeBadgeClass(user.strikesCount),
              'text-[13px] px-2 py-[1px]',
            )}
          >
            {formatStrikesDisplay(user.strikesCount)}
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
          <Badge
            variant={user.role === Role.USER ? 'secondary' : 'destructive'}
          >
            {user.role}
          </Badge>
        </TableCell>
        <TableCell>
          <Badge className={statusInfo.className}>{statusInfo.text}</Badge>
        </TableCell>

        <TableCell>
          <UserActions
            id={user.id}
            role={user.role}
            isSuspended={user.status === UserStatus.SUSPENDED}
            isBanned={user.status === UserStatus.BANNED}
          />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <AdminItemsTable
      items={users}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      skeleton={<AdminUsersTableSkeleton />}
      tableHeader={tableHeader}
      renderRow={renderRow}
      emptyStateMessage='No user matches your filters.'
      colSpan={9}
    />
  );
};

export default UsersTable;
