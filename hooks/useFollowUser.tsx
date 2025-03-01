import { Icons } from '@/components/icons';
import type { AuthorInfoProps } from '@/lib/types';
import useFollowUserStore from '@/store/followUser';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { toast } from 'sonner';

const useFollowUser = ({ author }: { author: AuthorInfoProps }) => {
  const { user: loggedUser } = useUser();
  const trpcUtils = api.useUtils();
  const { follows, toggleFollow: toggleFollowGlobal } = useFollowUserStore();

  const isSameUser = author.id === loggedUser?.id;
  const isFollowedByMe = follows[author.id] || false;

  const { mutateAsync: toggleFollow, isLoading } =
    api.user.toggleFollow.useMutation({
      onMutate: () => {
        toggleFollowGlobal(author.id);
        return { previousFollowedByMe: isFollowedByMe };
      },
      onError: (error, variables, context) => {
        toggleFollowGlobal(author.id);
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
          {data.followUser ? 'Unfollowed' : 'Followed'}
        </div>
      ),
      error: 'Error',
      richColors: true,
    });
  };

  return { handleToggleFollow, isLoading, isSameUser, isFollowedByMe };
};

export default useFollowUser;
