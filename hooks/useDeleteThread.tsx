import { UseDeletePostProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useDeleteThread = ({ id, onClose, isAdmin }: UseDeletePostProps) => {
  const trpcUtils = api.useUtils();

  const { mutateAsync: deleteThread, isPending } =
    api.thread.deleteThread.useMutation({
      onSettled: async () => {
        if (isAdmin) await trpcUtils.admin.getAllPosts.invalidate();
        else await trpcUtils.invalidate();
      },
      retry: false,
    });

  const handleDeleteThread = () => {
    onClose();
    const promise = deleteThread({ id });

    toast.promise(promise, {
      loading: 'Deleting...',
      success: () => 'Deleted',
      error: 'Error deleting thread.',
      richColors: true,
    });
  };

  return { handleDeleteThread, isDeleting: isPending };
};

export default useDeleteThread;
