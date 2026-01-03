import { useMutedUsers } from '@/store/mutedUsers';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useToggleMuteUser = ({ userId }: { userId: string }) => {
  const { muteUser, unmuteUser } = useMutedUsers();
  const trpcUtils = api.useUtils();

  const { mutate: toggleMuteUser, isPending } =
    api.user.toggleMuteUser.useMutation({
      onMutate: () => {
        const isCurrentlyMuted = useMutedUsers.getState().isMutedUser(userId);
        isCurrentlyMuted ? unmuteUser(userId) : muteUser(userId);
      },
      onError: () => {
        toast.error('Something went wrong!');
      },
      onSuccess: (data) => {
        toast.success(data?.muted ? 'Muted' : 'Unmuted');
      },
      onSettled: () => {
        trpcUtils.user.getUserProfile.invalidate();
        trpcUtils.user.getMutedUsers.invalidate();
      },
    });

  return {
    handleToggleMuteUser: toggleMuteUser,
    isLoading: isPending,
  };
};

export default useToggleMuteUser;
