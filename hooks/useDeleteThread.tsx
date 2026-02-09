import { useOptimisticAction } from '@/contexts/OptimisticActionContext';
import { UseDeletePostProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useDeleteThread = ({ id, onClose, isAdmin }: UseDeletePostProps) => {
  const performAction = useOptimisticAction();
  const utils = api.useUtils();

  const { mutate: deleteThread } = api.thread.deleteThread.useMutation({
    onError: (err) => {
      if (performAction) {
        performAction(id, 'DELETE', false);
      }
      toast.error('Failed to delete thread');
    },

    onSettled: () => {
      // if (isAdmin) {
      //   utils.admin.getAllThreads.invalidate();
      // } else {
      //   utils.thread.getAllThreads.invalidate();
      // }
      utils.thread.invalidate();
    },
  });

  const handleDeleteThread = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (performAction) {
      onClose();
      performAction(id, 'DELETE', true);
      toast.success('Deleted');
    }

    deleteThread({ id });
  };
  return { handleDeleteThread };
};

export default useDeleteThread;
