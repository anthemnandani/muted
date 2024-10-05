'use client';

import { Follow } from '@/components/ui/follow-button';
import type { AuthorInfoProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { Icons } from '../icons';

interface FollowButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'default' | 'outline';
  author: AuthorInfoProps;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  variant,
  author,
  className,
}) => {
  const path = usePathname();
  const { user: loggedUser } = useUser();
  const trpcUtils = api.useUtils();

  const isSameUser = author.id === loggedUser?.id;
  const followUpdate = React.useRef({
    isFollowedByMe: author.followers?.some(
      (user) => user.id === loggedUser?.id
    ),
  });

  const { mutateAsync: toggleFollow, isLoading } =
    api.user.toggleFollow.useMutation({
      onMutate: () => {
        const previousFollowedByMe = followUpdate.current.isFollowedByMe;
        followUpdate.current.isFollowedByMe = !previousFollowedByMe;
        return { previousFollowedByMe };
      },
      onError: (error, variables, context) => {
        followUpdate.current.isFollowedByMe =
          context?.previousFollowedByMe ?? followUpdate.current.isFollowedByMe;
        toast.error('FollowError: Something went wrong!');
      },
      onSettled: async () => {
        if (path === '/') {
          await trpcUtils.post.getInfinitePosts.invalidate();
        }
        await trpcUtils.invalidate();
      },
    });

  const handleToggleFollow = () => {
    toast.promise(toggleFollow({ id: author.id }), {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          {followUpdate.current.isFollowedByMe
            ? 'Unfollowing...'
            : 'Following...'}
        </div>
      ),
      success: () => (
        <div className='flex-center p-0'>
          {followUpdate.current.isFollowedByMe ? 'Followed' : 'Unfollowed'}
        </div>
      ),
      error: 'Error',
      richColors: true,
    });
  };

  return (
    <Follow
      disabled={isLoading || isSameUser}
      onClick={handleToggleFollow}
      variant={!followUpdate.current.isFollowedByMe ? variant : 'outline'}
      className={cn('rounded-xl py-1.5 px-4 select-none', className, {
        'opacity-80': followUpdate.current.isFollowedByMe,
      })}
    >
      {followUpdate.current.isFollowedByMe ? 'Following' : 'Follow'}
    </Follow>
  );
};

export default FollowButton;
