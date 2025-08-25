import NotificationSkeleton from '../skeletons/NotificationSkeleton';
import FollowRequestSkeleton from '../skeletons/FollowRequestSkeleton';

const NotificationLoader = ({
  isFollowRequest = false,
}: {
  isFollowRequest?: boolean;
}) => {
  return (
    <div className='flex-1 overflow-auto'>
      <div className='space-y-0'>
        {Array.from({ length: 8 }).map((_, index) =>
          isFollowRequest ? (
            <FollowRequestSkeleton key={index} />
          ) : (
            <NotificationSkeleton key={index} />
          )
        )}
      </div>
    </div>
  );
};

export default NotificationLoader;
