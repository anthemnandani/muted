'use client';

import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table';
import { AdminItemsTableProps } from '@/lib/types';
import { Fragment } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import TableLoader from './TableLoader';

export default function AdminItemsTable<T>({
  items,
  isLoading,
  hasNextPage,
  fetchNextPage,
  skeleton,
  tableHeader,
  renderRow,
  emptyStateMessage,
  colSpan,
  children,
}: AdminItemsTableProps<T>) {
  if (isLoading) {
    return skeleton;
  }

  return (
    <Fragment>
      <div
        className='relative h-[75vh] rounded-lg border overflow-y-auto'
        id='scrollableTableContainer'
      >
        <InfiniteScroll
          dataLength={items?.length ?? 0}
          next={fetchNextPage}
          hasMore={hasNextPage ?? false}
          scrollableTarget='scrollableTableContainer'
          loader={<TableLoader />}
        >
          <Table>
            {tableHeader}
            <TableBody>
              {!isLoading && items?.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={colSpan}
                    className='py-10 text-center text-sm text-muted-foreground'
                  >
                    {emptyStateMessage}
                  </TableCell>
                </TableRow>
              ) : (
                items?.map((item) => renderRow(item))
              )}
            </TableBody>
          </Table>
        </InfiniteScroll>
      </div>
      {children}
    </Fragment>
  );
}
