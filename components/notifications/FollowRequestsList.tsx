import { useNotificationStore } from '@/store/notificationStore';
import { api } from '@/trpc/react';
import { Fragment } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import FollowRequestCard from '../cards/FollowRequestCard';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import NotificationLoader from './NotificationLoader';

const FollowRequestsList = () => {
  const { isNotificationOpen, setMode } = useNotificationStore();
  const { data, isLoading, isError, hasNextPage, fetchNextPage } =
    api.notification.getFollowRequests.useInfiniteQuery(
      {},
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        enabled: isNotificationOpen,
        refetchOnWindowFocus: false,
      }
    );

  const allRequests = data?.pages.flatMap((page) => page.requests);

  if (isLoading) {
    return <NotificationLoader isFollowRequest />;
  }

  return (
    <Fragment>
      <div className='flex space-between'>
        <div
          role='button'
          className='flex items-center mb-2 mr-auto ml-4'
          onClick={() => setMode('ALL')}
        >
          <Icons.chevronLeft fill='#ffffffbf' />
          <span className='antialiased text-sm text-white/75'>Back</span>
        </div>
      </div>
      {allRequests?.length === 0 || isError ? (
        <EmptyState
          icon={<Icons.allActivity />}
          title='Follow requests'
          description='You have no pending follow requests right now.'
          isNotification
        />
      ) : (
        <InfiniteScroll
          dataLength={allRequests?.length ?? 0}
          next={fetchNextPage}
          hasMore={hasNextPage ?? false}
          loader={
            <div className='h-[80px] w-full flex-center mb-[10vh] sm:mb-0'>
              <Icons.loading className='size-11' />
            </div>
          }
        >
          {allRequests?.map(({ id, requester }, index) => (
            <FollowRequestCard
              key={id}
              id={id}
              username={requester.username}
              fullName={requester.fullName ?? ''}
              image={requester.image ?? ''}
              isLast={allRequests.length - 1 === index}
            />
          ))}
        </InfiniteScroll>
      )}
    </Fragment>
  );
};

export default FollowRequestsList;
