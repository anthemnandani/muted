import { useActivityStore } from '@/store/activityStore';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useInteractionsMutations = () => {
  const utils = api.useUtils();
  const { tab, contentType, selectedIds, exitSelecting } = useActivityStore();

  const onSuccessCb = () => exitSelecting();
  const onErrorCb = (err: any) => {
    toast.error(err.message || 'Something went wrong. Please try again.');
  };

  const unlikePosts = api.activity.bulkUnlikePosts.useMutation({
    onSuccess: onSuccessCb,
    onError: onErrorCb,
    onSettled: () => {
      utils.activity.getUserLikedPosts.invalidate();
      utils.user.getUserLikedPosts.invalidate();
    },
  });

  const unlikeThreads = api.activity.bulkUnlikeThreads.useMutation({
    onSuccess: onSuccessCb,
    onError: onErrorCb,
    onSettled: () => {
      utils.activity.getUserLikedThreads.invalidate();
      utils.thread.getLikedThreads.invalidate();
    },
  });

  const delComments = api.activity.bulkDeleteComments.useMutation({
    onSuccess: onSuccessCb,
    onError: onErrorCb,
    onSettled: () => utils.activity.getUserComments.invalidate(),
  });

  const delThreadComments = api.activity.bulkDeleteThreadComments.useMutation({
    onSuccess: onSuccessCb,
    onError: onErrorCb,
    onSettled: () => utils.activity.getUserThreadComments.invalidate(),
  });

  const removePostReposts = api.activity.bulkRemoveReposts.useMutation({
    onSuccess: onSuccessCb,
    onError: onErrorCb,
    onSettled: () => {
      utils.activity.getUserReposts.invalidate();
      utils.user.getUserReposts.invalidate();
    },
  });

  const removeThreadReposts = api.activity.bulkRemoveThreadReposts.useMutation({
    onSuccess: onSuccessCb,
    onError: onErrorCb,
    onSettled: () => {
      utils.activity.getUserThreadReposts.invalidate();
      utils.thread.getUserThreadReposts.invalidate();
    },
  });

  const isDeleting =
    unlikePosts.isPending ||
    unlikeThreads.isPending ||
    delComments.isPending ||
    delThreadComments.isPending ||
    removePostReposts.isPending ||
    removeThreadReposts.isPending;

  const handleDelete = () => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);

    if (tab === 'likes') {
      if (contentType === 'posts') unlikePosts.mutate({ postIds: ids });
      else unlikeThreads.mutate({ threadIds: ids });
    } else if (tab === 'comments') {
      if (contentType === 'posts') delComments.mutate({ postIds: ids });
      else delThreadComments.mutate({ threadIds: ids });
    } else if (tab === 'reposts') {
      if (contentType === 'posts') removePostReposts.mutate({ postIds: ids });
      else removeThreadReposts.mutate({ threadIds: ids });
    }
  };

  return { handleDelete, isDeleting };
};

export default useInteractionsMutations;
