import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useUserActions = ({ userId }: { userId: string }) => {
  const trpcUtils = api.useUtils();
  const { mutateAsync: suspendUser, isPending: isSuspendingUser } =
    api.admin.suspendUser.useMutation({
      onSettled: async () => {
        await trpcUtils.admin.getAllUsers.invalidate();
      },
    });

  const handleSuspend = (suspensionEndDate: Date) => {
    const promise = suspendUser({ userId, suspensionEndDate });

    toast.promise(promise, {
      loading: 'Suspending user...',
      success: () => 'User has been suspended.',
      error: 'Error suspending user.',
      richColors: true,
    });
  };

  const { mutateAsync: unsuspendUser, isPending: isUnsuspendingUser } =
    api.admin.unsuspendUser.useMutation({
      onSettled: async () => {
        await trpcUtils.admin.getAllUsers.invalidate();
      },
    });

  const handleUnsuspend = () => {
    const promise = unsuspendUser({ userId });

    toast.promise(promise, {
      loading: 'Unsuspending user...',
      success: () => 'User has been unsuspended.',
      error: 'Error unsuspending user.',
      richColors: true,
    });
  };

  const { mutateAsync: banUser, isPending: isBanningUser } =
    api.admin.banUser.useMutation({
      onSettled: async () => {
        await trpcUtils.admin.getAllUsers.invalidate();
      },
    });

  const handleBan = () => {
    const promise = banUser({ userId });

    toast.promise(promise, {
      loading: 'Banning user...',
      success: () => 'User has been banned.',
      error: 'Error banning user.',
      richColors: true,
    });
  };

  return {
    handleSuspend,
    handleUnsuspend,
    handleBan,
    isSuspendingUser,
    isUnsuspendingUser,
    isBanningUser,
  };
};

export default useUserActions;
