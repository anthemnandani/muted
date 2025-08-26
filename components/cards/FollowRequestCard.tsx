'use client';

import { useNotificationStore } from '@/store/notificationStore';
import { FollowRequestCardProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';

const FollowRequestCard: React.FC<FollowRequestCardProps> = ({
  id,
  username,
  fullName,
  image,
  isLast,
}) => {
  const router = useRouter();
  const trpcUtils = api.useUtils();
  const { setMode } = useNotificationStore();

  const handleOptimisticUpdate = () => {
    trpcUtils.notification.getFollowRequests.cancel();
    trpcUtils.notification.getFollowRequestsCount.cancel();

    const previousRequests =
      trpcUtils.notification.getFollowRequests.getInfiniteData();
    const previousCount =
      trpcUtils.notification.getFollowRequestsCount.getData();

    trpcUtils.notification.getFollowRequests.setInfiniteData({}, (oldData) => {
      if (!oldData) return;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          requests: page.requests.filter((req) => req.requester.id !== id),
        })),
      };
    });

    if (previousCount) {
      trpcUtils.notification.getFollowRequestsCount.setData(undefined, {
        followRequestsCount: Math.max(0, previousCount.followRequestsCount - 1),
      });
    }

    setMode('ALL');

    return { previousRequests, previousCount };
  };

  const handleMutationError = (
    context: Awaited<ReturnType<typeof handleOptimisticUpdate>> | undefined,
    errorMessage: string
  ) => {
    toast.error(errorMessage);
    if (context?.previousRequests) {
      trpcUtils.notification.getFollowRequests.setInfiniteData(
        {},
        context.previousRequests
      );
    }
    if (context?.previousCount) {
      trpcUtils.notification.getFollowRequestsCount.setData(
        undefined,
        context.previousCount
      );
    }
  };

  const { mutate: acceptRequest, isLoading: isAccepting } =
    api.notification.acceptFollowRequest.useMutation({
      onMutate: handleOptimisticUpdate,
      onError: (_, __, context) => {
        handleMutationError(context, 'Failed to accept request.');
      },
      onSettled: () => {
        trpcUtils.notification.getFollowRequests.invalidate();
        trpcUtils.notification.getFollowRequestsCount.invalidate();
        trpcUtils.notification.getNotifications.invalidate();
      },
    });

  const { mutate: deleteRequest, isLoading: isDeleting } =
    api.notification.deleteFollowRequest.useMutation({
      onMutate: handleOptimisticUpdate,
      onError: (_, __, context) => {
        handleMutationError(context, 'Failed to delete request.');
      },
      onSettled: () => {
        trpcUtils.notification.getFollowRequests.invalidate();
        trpcUtils.notification.getFollowRequestsCount.invalidate();
        trpcUtils.notification.getNotifications.invalidate();
      },
    });

  const handleAction = (e: React.MouseEvent, action: 'accept' | 'delete') => {
    e.stopPropagation();
    if (action === 'accept') {
      acceptRequest({ requestId: id });
    } else {
      deleteRequest({ requestId: id });
    }
  };

  return (
    <div
      className={cn(
        'hover:bg-[#1a1a1a] transition-colors cursor-pointer',
        isLast && 'mb-20'
      )}
      onClick={() => router.push(`/@${username}`)}
    >
      <div className='flex items-start py-2.5 px-3'>
        <Avatar className='size-12 rounded-full object-cover flex-[0_0_48px]'>
          <AvatarImage
            src={image}
            alt={fullName}
            className='rounded-full w-full h-full object-cover'
          />
          <AvatarFallback>{username?.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className='flex-1 px-3'>
          <Link
            href={`/@${username}`}
            onClick={(e) => e.stopPropagation()}
            className='line-clamp-1 break-words truncate font-semibold text-sm text-white/90 hover:underline'
          >
            {username}
          </Link>
          <p className='text-ellipsis line-clamp-1 break-words max-h-[130px] text-white/50'>
            {fullName}
          </p>
          <div className='mt-2 flex items-center gap-2'>
            <Button
              onClick={(e) => handleAction(e, 'delete')}
              disabled={isAccepting || isDeleting}
              variant='ghost'
              size='sm'
              className='bg-white-13 hover:bg-white/10 text-white/90 min-w-24 min-h-7 font-semibold'
            >
              Delete
            </Button>
            <Button
              onClick={(e) => handleAction(e, 'accept')}
              disabled={isAccepting || isDeleting}
              variant='ghost'
              size='sm'
              className='bg-primary-blue hover:bg-primary-blue/85 text-white/90 min-w-24 min-h-7 font-semibold'
            >
              Accept
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowRequestCard;
