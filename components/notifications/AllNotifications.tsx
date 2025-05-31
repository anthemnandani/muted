'use client';

import { useNotificationStore } from '@/store/notificationStore';
import { api } from '@/trpc/react';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import NotificationLoader from './NotificationLoader';
import NotificationsList from './NotificationsList';

const AllNotifications = () => {
  const { isNotificationOpen } = useNotificationStore();
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.notification.getNotifications.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        enabled: isNotificationOpen,
        staleTime: 0,
        cacheTime: 0,
        refetchOnWindowFocus: false,
      }
    );

  const allNotifications = data?.pages.flatMap((page) => page.notifications);

  if (isLoading) {
    return <NotificationLoader />;
  }

  return allNotifications?.length === 0 || isError ? (
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
  );
};

export default AllNotifications;
