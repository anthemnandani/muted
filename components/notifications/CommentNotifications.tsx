'use client';

import { api } from '@/trpc/react';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import NotificationLoader from './NotificationLoader';
import NotificationsList from './NotificationsList';

const CommentNotifications = () => {
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.notification.getCommentNotifications.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        // staleTime: 0,
        // cacheTime: 0,
        refetchOnWindowFocus: false,
      }
    );

  const commentNotifications = data?.pages.flatMap(
    (page) => page.notifications
  );

  if (isLoading) {
    return <NotificationLoader />;
  }

  return commentNotifications?.length === 0 || isError ? (
    <EmptyState
      icon={<Icons.comments />}
      title='Comments on your posts'
      description='When someone comments on one of your posts, you’ll see it here'
      isNotification
    />
  ) : (
    <NotificationsList
      notifications={commentNotifications!}
      hasNextPage={hasNextPage}
      fetchNextPage={fetchNextPage}
    />
  );
};

export default CommentNotifications;
