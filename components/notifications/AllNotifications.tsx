'use client';

import useNotification from '@/hooks/useNotification';
import { useNotificationStore } from '@/store/notificationStore';
import { api } from '@/trpc/react';
import { Fragment } from 'react';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import FollowRequestsLink from './FollowRequestsLink';
import FollowRequestsList from './FollowRequestsList';
import NotificationLoader from './NotificationLoader';
import NotificationsList from './NotificationsList';

const AllNotifications = () => {
  const { isNotificationOpen, mode } = useNotificationStore();
  const { followRequestsCount } = useNotification();
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.notification.getNotifications.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        enabled: isNotificationOpen && mode === 'ALL',
        refetchOnWindowFocus: false,
      }
    );

  const allNotifications = data?.pages.flatMap((page) => page.notifications);

  if (mode === 'FOLLOW_REQUESTS') {
    return <FollowRequestsList />;
  }
  const hasNoActivity =
    followRequestsCount === 0 &&
    !isLoading &&
    (!allNotifications || allNotifications.length === 0 || isError);

  if (hasNoActivity) {
    return (
      <EmptyState
        icon={<Icons.allActivity />}
        title='All activity'
        description='Notifications about your account will appear here.'
        isNotification
      />
    );
  }

  return (
    <Fragment>
      {followRequestsCount > 0 && (
        <FollowRequestsLink count={followRequestsCount} />
      )}

      {isLoading ? (
        <NotificationLoader />
      ) : (
        allNotifications &&
        allNotifications.length > 0 && (
          <NotificationsList
            notifications={allNotifications}
            hasNextPage={hasNextPage}
            fetchNextPage={fetchNextPage}
          />
        )
      )}
    </Fragment>
  );
};

export default AllNotifications;
