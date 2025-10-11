import useDeletePostStore from '@/store/deletePost';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

interface UseDeletePostProps {
  postId: string;
  closeMenu?: () => void;
  isAdmin?: boolean;
}

const useDeletePost = ({
  postId,
  closeMenu,
  isAdmin = false,
}: UseDeletePostProps) => {
  const { setOpenDeleteDialog } = useDeletePostStore();
  const trpcUtils = api.useUtils();

  const { mutateAsync: deletePost, isLoading } =
    api.post.deletePost.useMutation({
      onSettled: async () => {
        if (isAdmin) await trpcUtils.admin.getAllPosts.invalidate();
        else {
          await trpcUtils.post.getComments.invalidate();
          await trpcUtils.post.getReplies.invalidate();
        }
      },
      retry: false,
    });

  const handleDeletePost = () => {
    setOpenDeleteDialog(false);
    closeMenu?.();
    const promise = deletePost({ id: postId });

    toast.promise(promise, {
      loading: 'Deleting...',
      success: () => 'Deleted',
      error: 'Error deleting post.',
      richColors: true,
    });
  };

  return { handleDeletePost, isDeleting: isLoading };
};

export default useDeletePost;
