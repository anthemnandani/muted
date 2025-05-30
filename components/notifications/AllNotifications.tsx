'use client';

import { api } from '@/trpc/react';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import Loader from '../shared/Loader';
import NotificationsList from './NotificationsWrapper';

const AllNotifications = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.notification.getNotifications.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 0,
        cacheTime: 0,
        refetchOnWindowFocus: false,
      }
    );

  const allNotifications = data?.pages.flatMap((page) => page.notifications);

  if (isLoading) {
    return (
      <div className='flex-1 overflow-auto'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='flex-1 overflow-auto mt-3'>
      {allNotifications?.length === 0 || isError ? (
        <EmptyState
          icon={<Icons.allActivity />}
          title='All activity'
          description='Notifications about your account will appear here.'
          isNotification
        />
      ) : (
        <NotificationsList
          notifications={allNotifications!}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      )}
    </div>
  );
};

export default AllNotifications;
