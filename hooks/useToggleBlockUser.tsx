import { Icons } from '@/components/icons';
import { UseToggleBlockUserProps } from '@/lib/types';
import { useBlockedUsers } from '@/store/blockedUsers';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useToggleBlockUser = ({
  userId,
  username,
  setIsOpen,
  closeMenu,
}: UseToggleBlockUserProps) => {
  const { isUserBlocked, addBlockedUser, removeBlockedUser } =
    useBlockedUsers();

  const isBlockedByMe = isUserBlocked(userId);

  const { mutateAsync: toggleBlockUser, isLoading } =
    api.user.toggleBlockUser.useMutation({
      onMutate: () => {
        closeMenu();
        setIsOpen(false);
        return { previousBlockedByMe: isBlockedByMe };
      },
      onSuccess: (data) => {
        if (data.blocked) {
          addBlockedUser(userId);
        } else {
          removeBlockedUser(userId);
        }
      },
      onError: (error) => {
        toast.error(`BlockError: ${error.message || 'Something went wrong!'}`);
      },
      //   onSettled: async () => {
      //     await trpcUtils.invalidate();
      //   },
    });

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
