import { NotificationsListProps } from '@/lib/types';
import InfiniteScroll from 'react-infinite-scroll-component';
import NotificationCard from '../cards/NotificationCard';
import { Icons } from '../icons';

const NotificationsList = ({
  notifications,
  hasNextPage,
  fetchNextPage,
}: NotificationsListProps) => {
  return (
    <InfiniteScroll
      dataLength={notifications?.length ?? 0}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      loader={
        <div className='h-[80px] w-full flex-center mb-[10vh] sm:mb-0'>
          <Icons.loading className='size-11' />
        </div>
      }
    >
      {notifications?.map((notification, index) => (
        <NotificationCard
          key={notification.id}
          sender={notification.senderUser}
          message={notification.message}
          createdAt={notification.createdAt}
          media={notification.media?.[0]}
          postId={notification.postId}
          type={notification.type}
          isLast={index === notifications.length - 1}
        />
      ))}
    </InfiniteScroll>
  );
};

export default NotificationsList;
