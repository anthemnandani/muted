import { useMutedUsers } from '@/store/mutedUsers';
import { api } from '@/trpc/react';
import { useRef } from 'react';
import { toast } from 'sonner';

const useToggleMuteUser = ({ userId }: { userId: string }) => {
  const { muteUser, unmuteUser, isMutedUser } = useMutedUsers();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);
  const isMuted = isMutedUser(userId);

  const { mutate: toggleMuteUser } = api.user.toggleMuteUser.useMutation({
    onError: (err) => {
      if (isMuted) {
        muteUser(userId);
      } else {
        unmuteUser(userId);
      }
      toast.error('Failed to update user visibility');
      isDirtyRef.current = false;
    },

    onSettled: () => {
      isDirtyRef.current = false;
    },
  });

  const toggleMute = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (isMuted) {
      unmuteUser(userId);
      toast.success('Unmuted');
    } else {
      muteUser(userId);
      toast.success('Muted');
    }

    isDirtyRef.current = !isDirtyRef.current;

    timeoutRef.current = setTimeout(() => {
      if (isDirtyRef.current) {
        toggleMuteUser({ userId });
      }
    }, 1000);
  };

  return {
    toggleMute,
  };
};

export default useToggleMuteUser;
