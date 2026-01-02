'use client';

import CommentView from '@/components/modals/CommentView';
import PostView from '@/components/modals/PostView';
import UserAvatar from '@/components/shared/UserAvatar';
import AdminReportsTableSkeleton from '@/components/skeletons/AdminReportsTableSkeleton';
import { Badge } from '@/components/ui/badge';
import {
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useDebounce from '@/hooks/useDebounce';
import type { AdminReport, AdminReportPost } from '@/lib/types';
import {
  getPostThumbnail,
  getReportStatusClass,
  getReportType,
} from '@/lib/utils';
import { useAdminFiltersStore } from '@/store/adminFiltersStore';
import { api } from '@/trpc/react';
import { useState } from 'react';
import AdminItemsTable from './AdminItemsTable';
import ReportActions from './ReportActions';

const ReportsTable = () => {
  const { reportSearch, reportStatus } = useAdminFiltersStore();
  const debouncedSearch = useDebounce(reportSearch, 500);

  const [selectedPost, setSelectedPost] = useState<AdminReportPost | null>(
    null
  );
  const [selectedComment, setSelectedComment] =
    useState<AdminReportPost | null>(null);

  const { data, isLoading, hasNextPage, fetchNextPage } =
    api.admin.getAllReports.useInfiniteQuery(
      {
        search: debouncedSearch,
        status: reportStatus === 'ALL' ? undefined : reportStatus,
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

  const reports = data?.pages.flatMap((page) => page.reports);

  const tableHeader = (
    <TableHeader className='sticky top-0 z-10 bg-muted/50 backdrop-blur supports-[backdrop-filter]:bg-muted/40'>
      <TableRow>
        <TableHead className='w-[18%] pl-6'>Reported Item</TableHead>
        <TableHead className='w-[10%]'>Report Type</TableHead>
        <TableHead className='w-[18%]'>Reporter</TableHead>
        <TableHead className='w-[10%]'>Status</TableHead>
        <TableHead className='w-[14%]'>Reported Date</TableHead>
        <TableHead className='w-[20%] pr-6'>Reason</TableHead>
        <TableHead className='text-center pr-6'>Actions</TableHead>
      </TableRow>
    </TableHeader>
  );

  const renderRow = (report: AdminReport) => {
    const { id, post, user, reporter, status, createdAt, reason } = report;
    return (
      <TableRow key={id} className='bg-transparent hover:bg-muted/30'>
        <TableCell>
          {post ? (
            post.parentPostId ? (
              <button onClick={() => setSelectedComment(post)}>
                <p className='w-full max-w-[200px] truncate text-sm text-white/85 hover:text-white py-5'>
                  {post.text || 'View Comment'}
                </p>
              </button>
            ) : (
              <button onClick={() => setSelectedPost(post)}>
                <img
                  src={getPostThumbnail(post.media?.[0])}
                  alt='Post media preview'
                  loading='lazy'
                  width={64}
                  height={64}
                  className='rounded-md object-cover ring-1 ring-border'
                />
              </button>
            )
          ) : user ? (
            <UserAvatar
              username={user.username}
              fullname={user?.fullName}
              image={user.image}
              className='py-10'
              showInfo
            />
          ) : (
            <span className='text-sm text-muted-foreground'>N/A</span>
          )}
        </TableCell>

        <TableCell className='text-sm capitalize text-white/65'>
          {getReportType(report)}
        </TableCell>

        <TableCell>
          <UserAvatar
            username={reporter.username}
            fullname={reporter?.fullName}
            image={reporter.image}
            showInfo
          />
        </TableCell>

        <TableCell>
          <Badge variant='outline' className={getReportStatusClass(status)}>
            {status}
          </Badge>
        </TableCell>

        <TableCell className='text-sm text-white/65'>
          {new Date(createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </TableCell>

        <TableCell
          className='max-w-[200px] truncate text-sm text-white/65'
          title={reason}
        >
          {reason?.split('>')?.at(-1)?.trim()}
        </TableCell>

        <TableCell>
          <ReportActions report={report} />
        </TableCell>
      </TableRow>
    );
  };
  return (
    <AdminItemsTable
      items={reports}
      isLoading={isLoading}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
      skeleton={<AdminReportsTableSkeleton />}
      tableHeader={tableHeader}
      renderRow={renderRow}
      emptyStateMessage=' No reports match your filters.'
      colSpan={7}
    >
      {selectedPost && (
        <PostView
          post={selectedPost}
          isOpen={!!selectedPost}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedPost(null);
            }
          }}
        />
      )}
      {selectedComment && (
        <CommentView
          text={selectedComment.text!}
          author={selectedComment.author}
          mentions={selectedComment.mentions}
          isOpen={!!selectedComment}
          onOpenChange={(isOpen) => {
            if (!isOpen) {
              setSelectedComment(null);
            }
          }}
        />
      )}
    </AdminItemsTable>
  );
};

export default ReportsTable;
