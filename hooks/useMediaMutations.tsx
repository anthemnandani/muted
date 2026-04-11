import { useActivityStore } from '@/store/activityStore';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useMediaMutations = () => {
  const utils = api.useUtils();
  const { mediaTab, selectedIds, exitSelecting } = useActivityStore();

  const onSuccessCb = () => exitSelecting();
  const onErrorCb = (err: any) => {
    toast.error(err.message || 'Something went wrong. Please try again.');
  };

  const deletePosts = api.activity.bulkDeletePosts.useMutation({
    onSuccess: onSuccessCb,
    onError: onErrorCb,
    onSettled: () => {
      utils.activity.getUserPosts.invalidate();
      utils.user.getUserPosts.invalidate();
    },
  });

  const deleteThreads = api.activity.bulkDeleteThreads.useMutation({
    onSuccess: onSuccessCb,
    onError: onErrorCb,
    onSettled: () => {
      utils.activity.getUserThreads.invalidate();
    },
  });

  const isDeleting = deletePosts.isPending || deleteThreads.isPending;

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    if (mediaTab === 'threads') deleteThreads.mutate({ threadIds: ids });
    else deletePosts.mutate({ postIds: ids });
  };

  return { handleDelete, isDeleting };
};

export default useMediaMutations;
