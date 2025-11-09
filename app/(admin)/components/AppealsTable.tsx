'use client';

import ViewReason from '@/components/modals/ViewReason';
import UserAvatar from '@/components/shared/UserAvatar';
import AdminAppealsTableSkeleton from '@/components/skeletons/AdminAppealsTableSkeleton';
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
  formatDate,
  formatDateAndTime,
  getAppealStatusInfo,
} from '@/lib/utils';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import { api } from '@/trpc/react';
import InfiniteScroll from 'react-infinite-scroll-component';
import AppealActions from './AppealActions';
import TableLoader from './TableLoader';

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
        retry: false,
      }
    );

  const appeals = data?.pages.flatMap((page) => page.appeals);

  if (isLoading) {
    return <AdminAppealsTableSkeleton />;
  }

  return (
    <div
      className='relative h-[75vh] rounded-lg border overflow-y-auto'
      id='scrollableTableContainer'
    >
      <InfiniteScroll
        dataLength={appeals?.length ?? 0}
        next={fetchNextPage}
        hasMore={hasNextPage ?? false}
        scrollableTarget='scrollableTableContainer'
        loader={<TableLoader />}
      >
        <Table>
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

          <TableBody>
            {!isLoading && appeals?.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className='py-10 text-center text-sm text-muted-foreground'
                >
                  No appeals match your filters.
                </TableCell>
              </TableRow>
            ) : (
              appeals?.map((appeal) => {
                const statusInfo = getAppealStatusInfo(appeal.status);
                const { id, user, suspension, reason, status, createdAt } =
                  appeal;
                return (
                  <TableRow
                    key={id}
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
                      <Badge
                        className={cn('text-[13px]', statusInfo.className)}
                      >
                        {statusInfo.text}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <AppealActions appealId={id} status={status} />
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

export default AppealsTable;
