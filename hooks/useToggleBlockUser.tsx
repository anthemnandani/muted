import { UseToggleBlockUserProps } from '@/lib/types';
import { useBlockedUsers } from '@/store/blockedUsers';
import { api } from '@/trpc/react';
import { useRef } from 'react';
import { toast } from 'sonner';

const useToggleBlockUser = ({
  userId,
  isProfile,
  isBlocked,
}: UseToggleBlockUserProps) => {
  const { isUserBlocked, addBlockedUser, removeBlockedUser } =
    useBlockedUsers();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  const trpcUtils = api.useUtils();

  const isBlockedByMe = isProfile || isBlocked || isUserBlocked(userId);

  const { mutate: toggleBlockUser } = api.user.toggleBlockUser.useMutation({
    onError: (error) => {
      if (isBlockedByMe) removeBlockedUser(userId);
      else addBlockedUser(userId);
      toast.error('Failed to update block status');
    },
    onSettled: () => {
      isDirtyRef.current = false;
      trpcUtils.user.getUserProfile.invalidate();
      trpcUtils.user.getBlockedUsers.invalidate();
    },
  });

  const toggleBlock = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (isBlockedByMe) {
      removeBlockedUser(userId);
      toast.success('Unblocked');
    } else {
      addBlockedUser(userId);
      toast.success('Blocked');
    }

    isDirtyRef.current = !isDirtyRef.current;

    timeoutRef.current = setTimeout(() => {
      if (isDirtyRef.current) {
        toggleBlockUser({ targetUserId: userId });
      }
    }, 1000);
  };

  return { toggleBlock, isBlockedByMe };
};

export default useToggleBlockUser;
