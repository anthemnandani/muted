import { Icons } from '@/components/icons';
import type { AuthorInfoProps, FollowStatus } from '@/lib/types';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

const useFollowUser = ({ author }: { author: AuthorInfoProps }) => {
  const { user: loggedUser } = useUser();
  const trpcUtils = api.useUtils();

  const isSameUser = author.id === loggedUser?.id;

  const [followStatus, setFollowStatus] =
    useState<FollowStatus>('NOT_FOLLOWING');

  useEffect(() => {
    const isFollowing = author.followers.some(
      (follower) => follower.followerId === loggedUser?.id
    );
    const isRequested = author.receivedFollowRequests?.some(
      (req) => req.requesterId === loggedUser?.id
    );

    if (isFollowing) {
      setFollowStatus('FOLLOWING');
    } else if (isRequested) {
      setFollowStatus('REQUESTED');
    } else {
      setFollowStatus('NOT_FOLLOWING');
    }
  }, [author.followers, author.receivedFollowRequests, loggedUser?.id]);

  const { mutateAsync: toggleFollow, isPending } =
    api.user.toggleFollow.useMutation({
      onSettled: async () => {
        await trpcUtils.user.userInfo.invalidate({ username: author.username });
      },
    });

  const handleToggleFollow = () => {
    if (isSameUser) return;

    const previousStatus = followStatus;

    setFollowStatus((currentStatus) => {
      if (currentStatus === 'FOLLOWING' || currentStatus === 'REQUESTED') {
        return 'NOT_FOLLOWING';
      }
      return author.privacy === 'PRIVATE' ? 'REQUESTED' : 'FOLLOWING';
    });

    toast.promise(toggleFollow({ id: author.id }), {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          Processing...
        </div>
      ),
      success: (data) => {
        if (data.status === 'FOLLOWING') return 'Followed!';
        if (data.status === 'REQUESTED') return 'Request sent!';
        return 'Unfollowed.';
      },
      error: (err) => {
        setFollowStatus(previousStatus);
        return 'An error occurred.';
      },
      richColors: true,
    });
  };

  return { handleToggleFollow, isLoading: isPending, isSameUser, followStatus };
};

export default useFollowUser;
