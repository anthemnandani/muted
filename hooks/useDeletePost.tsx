import { useOptimisticAction } from '@/contexts/OptimisticActionContext';
import { UseDeletePostProps } from '@/lib/types';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useDeletePost = ({
  id,
  onClose,
  isAdmin = false,
}: UseDeletePostProps) => {
  const { performAction } = useOptimisticAction();
  const trpcUtils = api.useUtils();

  const { mutate: deletePost } = api.post.deletePost.useMutation({
    onError: (err) => {
      if (performAction) {
        performAction(id, 'DELETE', false);
      }
      toast.error('Something went wrong');
    },

    onSettled: () => {
      if (isAdmin) {
        trpcUtils.admin.getAllPosts.invalidate();
      }
      trpcUtils.post.invalidate();
    },
  });

  const handleDeletePost = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    onClose();

    if (performAction) {
      performAction(id, 'DELETE', true);
      toast.success('Deleted');
    }

    deletePost({ id });
  };

  return { handleDeletePost };
};

export default useDeletePost;
