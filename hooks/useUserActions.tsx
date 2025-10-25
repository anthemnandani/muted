import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useUserActions = ({ userId }: { userId: string }) => {
  const trpcUtils = api.useUtils();
  const { mutateAsync: suspendUser, isLoading: isSuspendingUser } =
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

  const { mutateAsync: unsuspendUser, isLoading: isUnsuspendingUser } =
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

  return {
    handleSuspend,
    handleUnsuspend,
    isSuspendingUser,
    isUnsuspendingUser,
  };
};

export default useUserActions;
