import { useMutedUsers } from '@/store/mutedUsers';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useToggleMuteUser = ({ userId }: { userId: string }) => {
  const { muteUser, unmuteUser } = useMutedUsers();
  const trpcUtils = api.useUtils();

  const { mutateAsync: toggleMuteUser, isLoading } =
    api.user.toggleMuteUser.useMutation({
      onMutate: () => {
        const isCurrentlyMuted = useMutedUsers.getState().isMutedUser(userId);
        isCurrentlyMuted ? unmuteUser(userId) : muteUser(userId);
      },
      onError: () => {
        toast.error('Something went wrong!');
      },
      onSuccess: async (data) => {
        await trpcUtils.user.userInfo.invalidate();
        toast.success(data?.muted ? 'Muted' : 'Unmuted');
      },
    });

  return {
    handleToggleMuteUser: toggleMuteUser,
    isLoading,
  };
};

export default useToggleMuteUser;
