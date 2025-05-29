'use client';

import { api } from '@/trpc/react';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import Loader from '../shared/Loader';

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
    return (
      <div className='flex-1 overflow-auto'>
        <Loader />
      </div>
    );
  }

  return (
    <div className='flex-1 overflow-auto'>
      {mentionNotifications?.length === 0 || isError ? (
        <EmptyState
          icon={<Icons.mentions />}
          title='Mentions of You'
          description='When someone mentions you, you’ll see it here'
          isNotification
        />
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default MentionNotifications;
