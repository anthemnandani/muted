import type { BlockedOrMutedUser } from '@/lib/types';
import { useBlockedUsers } from '@/store/blockedUsers';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import UserAccountCard from './UserAccountCard';

const BlockedUserCard = ({
  blockedUser,
}: {
  blockedUser: BlockedOrMutedUser;
}) => {
  const { id, username, ...otherUserData } = blockedUser;
  const { isUserBlocked, addBlockedUser, removeBlockedUser } =
    useBlockedUsers();
  const trpcUtils = api.useUtils();

  const { mutate: toggleBlockUser, isLoading } =
    api.user.toggleBlockUser.useMutation({
      onMutate: async ({ targetUserId }) => {
        const wasBlocked = isUserBlocked(targetUserId);

        if (wasBlocked) {
          removeBlockedUser(targetUserId);
        } else {
          addBlockedUser(targetUserId);
        }

        return { wasBlocked };
      },

      onError: (err, { targetUserId }, context) => {
        toast.error(`Error: ${err.message}`);
        if (context?.wasBlocked) {
          addBlockedUser(targetUserId);
        } else {
          removeBlockedUser(targetUserId);
        }
      },

      onSuccess: (data) => {
        if (data.blocked) {
          toast.success(`Blocked @${username}`, {
            richColors: true,
          });
        } else {
          toast.success(`Unblocked @${username}`, {
            richColors: true,
          });
        }
        trpcUtils.user.userInfo.invalidate();
      },
    });

  return (
    <UserAccountCard
      {...otherUserData}
      username={username}
      isLoading={isLoading}
      onClick={() => toggleBlockUser({ targetUserId: id! })}
      btnTitle={isUserBlocked(id!) ? 'Unblock' : 'Block'}
    />
  );
};

export default BlockedUserCard;
