import { Icons } from '@/components/icons';
import { AuthorInfoProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { usePathname } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';

const useFollowUser = ({ author }: { author: AuthorInfoProps }) => {
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
  return { handleToggleFollow, isLoading, isSameUser, followUpdate };
};

export default useFollowUser;
