import { Icons } from '@/components/icons';
import { UseToggleBlockUserProps } from '@/lib/types';
import { useBlockedUsers } from '@/store/blockedUsers';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useToggleBlockUser = ({
  userId,
  username,
  isProfile,
  isBlocked,
}: UseToggleBlockUserProps) => {
  const {
    isUserBlocked,
    addBlockedUser,
    removeBlockedUser,
    setIsLoading,
    isLoading,
  } = useBlockedUsers();

  const trpcUtils = api.useUtils();

  const isBlockedByMe = isProfile || isBlocked || isUserBlocked(userId);

  const { mutateAsync: toggleBlockUser } = api.user.toggleBlockUser.useMutation(
    {
      onMutate: () => {
        setIsLoading(true);
        return { previousBlockedByMe: isBlockedByMe };
      },
      onSuccess: async (data) => {
        await trpcUtils.user.userInfo.invalidate();
        if (data.blocked) {
          addBlockedUser(userId);
        } else {
          removeBlockedUser(userId);
        }
        setIsLoading(false);
      },
      onError: (error) => {
        setIsLoading(false);
        toast.error(`BlockError: ${error.message || 'Something went wrong!'}`);
      },
    }
  );

  const handleToggleBlock = () => {
    toast.promise(toggleBlockUser({ targetUserId: userId }), {
      loading: (
        <div className='flex w-[270px] items-center justify-start gap-1.5 p-0'>
          <div>
            <Icons.loading className='size-8' />
          </div>
          {isBlockedByMe ? 'Unblocking...' : 'Blocking...'}
        </div>
      ),
      success: (data) => (
        <div className='flex-center p-0'>
          {data.blocked ? `Blocked @${username}` : `Unblocked @${username}`}
        </div>
      ),
      error: 'Error',
      richColors: true,
    });
  };

  return { handleToggleBlock, isLoading, isBlockedByMe };
};

export default useToggleBlockUser;
