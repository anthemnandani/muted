import { Icons } from '@/components/icons';
import type { AuthorInfoProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';
import { toast } from 'sonner';

const useFollowUser = ({ author }: { author: AuthorInfoProps }) => {
  const { user: loggedUser } = useUser();
  const trpcUtils = api.useUtils();

  const isSameUser = author.id === loggedUser?.id;
  const isFollowedByMe = useMemo(() => {
    return author.followers.some((follower) => follower.id === loggedUser?.id);
  }, [author.followers, loggedUser?.id]);

  const { mutateAsync: toggleFollow, isLoading } =
    api.user.toggleFollow.useMutation({
      onMutate: () => {
        return { previousFollowedByMe: isFollowedByMe };
      },
      onError: (error, variables, context) => {
        toast.error('FollowError: Something went wrong!');
      },
      onSettled: async () => {
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
          {isFollowedByMe ? 'Unfollowing...' : 'Following...'}
        </div>
      ),
      success: (data) => (
        <div className='flex-center p-0'>
          {data.followUser ? 'Followed' : 'Unfollowed'}
        </div>
      ),
      error: 'Error',
      richColors: true,
    });
  };

  return { handleToggleFollow, isLoading, isSameUser, isFollowedByMe };
};

export default useFollowUser;
