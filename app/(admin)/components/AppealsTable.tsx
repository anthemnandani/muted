'use client';

import ViewReason from '@/components/modals/ViewReason';
import UserAvatar from '@/components/shared/UserAvatar';
import AdminAppealsTableSkeleton from '@/components/skeletons/AdminAppealsTableSkeleton';
import { Badge } from '@/components/ui/badge';
import {
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useDebounce from '@/hooks/useDebounce';
import type { AdminAppeal } from '@/lib/types';
import {
  cn,
  formatDate,
  formatDateAndTime,
  getAppealStatusInfo,
} from '@/lib/utils';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import { api } from '@/trpc/react';
import AdminItemsTable from './AdminItemsTable';
import AppealActions from './AppealActions';

const AppealsTable = () => {
  const { appealSearch, appealStatus } = useAdminFiltersStore();

  const debouncedSearch = useDebounce(appealSearch, 500);

  const { data, isLoading, hasNextPage, fetchNextPage } =
    api.admin.getAppeals.useInfiniteQuery(
      {
        search: debouncedSearch,
        status: appealStatus === 'ALL' ? undefined : appealStatus,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        refetchOnWindowFocus: false,
        cacheTime: 10 * 60 * 1000,
        staleTime: 10 * 60 * 1000,
        retry: false,
      }
    );

  const appeals = data?.pages.flatMap((page) => page.appeals);

  const tableHeader = (
    <TableHeader className='sticky top-0 z-10 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/40'>
      <TableRow>
        <TableHead className='w-[20%] pl-6'>User</TableHead>
        <TableHead className='w-[15%]'>Suspension Date</TableHead>
        <TableHead className='w-[30%]'>Reason</TableHead>
        <TableHead className='w-[15%]'>Submitted At</TableHead>
        <TableHead>Status</TableHead>
        <TableHead className='text-center pr-6'>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  const renderRow = (appeal: AdminAppeal) => {
    const { id, user, suspension, reason, status, createdAt } = appeal;
    const statusInfo = getAppealStatusInfo(status);
    return (
      <TableRow key={id} className='bg-transparent hover:bg-muted/30'>
        <TableCell className='py-5 pl-6'>
          <UserAvatar
            username={user.username}
            fullname={user?.fullName}
            image={user.image}
            showInfo
          />
        </TableCell>

        <TableCell className='text-sm text-white/65'>
          {formatDate(suspension.createdAt)}
        </TableCell>

        <TableCell>
          <ViewReason reason={reason} />
        </TableCell>

        <TableCell className='text-sm text-white/65'>
          {formatDateAndTime(createdAt)}
        </TableCell>

        <TableCell>
          <Badge className={cn('text-[13px]', statusInfo.className)}>
            {statusInfo.text}
          </Badge>
        </TableCell>

        <TableCell>
          <AppealActions appealId={id} status={status} />
        </TableCell>
      </TableRow>
    );
  };

  return (
    <AdminItemsTable
      items={appeals}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      skeleton={<AdminAppealsTableSkeleton />}
      tableHeader={tableHeader}
      renderRow={renderRow}
      emptyStateMessage='No appeals matches your filters.'
      colSpan={6}
    />
  );
};

export default AppealsTable;
