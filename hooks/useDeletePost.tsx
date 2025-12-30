import { UseDeletePostProps } from '@/lib/types';
import useDeletePostStore from '@/store/deletePost';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useDeletePost = ({
  postId,
  closeMenu,
  isAdmin = false,
}: UseDeletePostProps) => {
  const { setOpenDeleteDialog } = useDeletePostStore();
  const trpcUtils = api.useUtils();

  const { mutateAsync: deletePost, isPending } =
    api.post.deletePost.useMutation({
      onSettled: async () => {
        if (isAdmin) await trpcUtils.admin.getAllPosts.invalidate();
        else {
          // Todo: Fix this
          await trpcUtils.invalidate();
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

  return { handleDeletePost, isDeleting: isPending };
};

export default useDeletePost;
