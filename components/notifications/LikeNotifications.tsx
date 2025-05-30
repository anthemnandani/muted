'use client';

import { api } from '@/trpc/react';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import Loader from '../shared/Loader';
import NotificationsList from './NotificationsWrapper';

const LikeNotifications = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.notification.getLikeNotifications.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 0,
        cacheTime: 0,
        refetchOnWindowFocus: false,
      }
    );

  const likeNotifications = data?.pages.flatMap((page) => page.notifications);

  if (isLoading) {
    return (
      <div className='flex-1 overflow-auto'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='flex-1 overflow-auto mt-3'>
      {likeNotifications?.length === 0 || isError ? (
        <EmptyState
          icon={<Icons.likes />}
          title='Likes on your posts'
          description='When someone likes one of your posts, you’ll see it here'
          isNotification
        />
      ) : (
        <NotificationsList
          notifications={likeNotifications!}
          hasNextPage={hasNextPage}
          fetchNextPage={fetchNextPage}
        />
      )}
    </div>
  );
};

export default LikeNotifications;
