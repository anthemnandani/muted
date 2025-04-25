import { useMutedUsers } from '@/store/mutedUsers';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useToggleMuteUser = ({ userId }: { userId: string }) => {
  const { muteUser, unmuteUser } = useMutedUsers();

  const { mutateAsync: toggleMuteUser, isLoading } =
    api.user.toggleMuteUser.useMutation({
      onMutate: () => {
        const isCurrentlyMuted = useMutedUsers.getState().isMutedUser(userId);
        isCurrentlyMuted ? unmuteUser(userId) : muteUser(userId);
      },
      onError: () => {
        toast.error('Something went wrong!');
      },
      onSettled: async (data) => {
        toast.success(data?.muted ? 'Muted' : 'Unmuted');
        // await Promise.all([
        //   trpcUtils.post.getComments.invalidate(),
        //   trpcUtils.user.postInfo.invalidate(),
        //   trpcUtils.user.repliesInfo.invalidate(),
        //   trpcUtils.user.repostsInfo.invalidate(),
        // ]);
      },
    });

  return {
    handleToggleMuteUser: toggleMuteUser,
    isLoading,
  };
};

export default useToggleMuteUser;
