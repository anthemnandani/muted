'use client';

import { api } from '@/trpc/react';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import NotificationLoader from './NotificationLoader';
import NotificationsList from './NotificationsList';

const MentionNotifications = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.notification.getMentionNotifications.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 0,
        cacheTime: 0,
        refetchOnWindowFocus: false,
      }
    );

  const mentionNotifications = data?.pages.flatMap(
    (page) => page.notifications
  );

  if (isLoading) {
    return <NotificationLoader />;
  }

  return mentionNotifications?.length === 0 || isError ? (
    <EmptyState
      icon={<Icons.mentions />}
      title='Mentions of You'
      description='When someone mentions you, you’ll see it here'
      isNotification
    />
  ) : (
    <NotificationsList
      notifications={mentionNotifications!}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
};

export default MentionNotifications;
