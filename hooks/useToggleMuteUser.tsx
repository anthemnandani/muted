import { useMutedUsers } from '@/store/mutedUsers';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

interface UseToggleMuteUserProps {
  setIsOpen?: (open: boolean) => void;
  userId: string;
}

export default function useToggleMuteUser({
  userId,
  setIsOpen,
}: UseToggleMuteUserProps) {
  const { muteUser, unmuteUser } = useMutedUsers();
  const trpcUtils = api.useUtils();

  const { mutateAsync: toggleMuteUser, isLoading } =
    api.user.toggleMuteUser.useMutation({
      onMutate: () => {
        setIsOpen?.(false);
        const isCurrentlyMuted = useMutedUsers.getState().isMutedUser(userId);
        isCurrentlyMuted ? unmuteUser(userId) : muteUser(userId);
      },
      onError: () => {
        toast.error('Something went wrong!');
      },
      onSettled: async (data) => {
        toast.success(data?.muted ? 'Muted' : 'Unmuted');
        await Promise.all([
          trpcUtils.post.getNestedPosts.invalidate(),
          trpcUtils.user.postInfo.invalidate(),
          trpcUtils.user.repliesInfo.invalidate(),
          trpcUtils.user.repostsInfo.invalidate(),
        ]);
      },
    });

  return {
    handleToggleMuteUser: toggleMuteUser,
    isLoading,
  };
}
