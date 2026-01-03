import type { BlockedOrMutedUser } from '@/lib/types';
import { useMutedUsers } from '@/store/mutedUsers';
import { api } from '@/trpc/react';
import { toast } from 'sonner';
import UserAccountCard from './UserAccountCard';

const MutedUserCard = ({ mutedUser }: { mutedUser: BlockedOrMutedUser }) => {
  const { id, username, ...otherUserData } = mutedUser;

  const { isMutedUser, muteUser, unmuteUser } = useMutedUsers();
  const trpcUtils = api.useUtils();

  const { mutate: toggleMuteUser, isPending } =
    api.user.toggleMuteUser.useMutation({
      onMutate: async ({ userId }) => {
        const wasMuted = isMutedUser(userId);

        if (wasMuted) {
          unmuteUser(userId);
        } else {
          muteUser(userId);
        }

        return { wasMuted };
      },

      onError: (err, { userId }, context) => {
        toast.error(`Error: ${err.message}`);
        if (context?.wasMuted) {
          muteUser(userId);
        } else {
          unmuteUser(userId);
        }
      },

      onSuccess: (data) => {
        if (data.muted) {
          toast.success(`Muted @${username}`, {
            richColors: true,
          });
        } else {
          toast.success(`Unmuted @${username}`, {
            richColors: true,
          });
        }
        trpcUtils.user.getUserProfile.invalidate();
      },
    });

  return (
    <UserAccountCard
      {...otherUserData}
      username={username}
      isLoading={isPending}
      onClick={() => toggleMuteUser({ userId: id! })}
      btnTitle={isMutedUser(id!) ? 'Unmute' : 'Mute'}
    />
  );
};

export default MutedUserCard;
