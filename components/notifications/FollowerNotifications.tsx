'use client';

import { api } from '@/trpc/react';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import NotificationLoader from './NotificationLoader';
import NotificationsList from './NotificationsList';

const FollowerNotifications = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.notification.getFollowerNotifications.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 0,
        cacheTime: 0,
        refetchOnWindowFocus: false,
      }
    );

  const followerNotifications = data?.pages.flatMap(
    (page) => page.notifications
  );

  if (isLoading) {
    return <NotificationLoader />;
  }

  return followerNotifications?.length === 0 || isError ? (
    <EmptyState
      icon={<Icons.followers />}
      title='New followers'
      description='When someone new follows you, you’ll see it here'
      isNotification
    />
  ) : (
    <NotificationsList
      notifications={followerNotifications!}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
};

export default FollowerNotifications;
