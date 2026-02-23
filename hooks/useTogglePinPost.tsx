import { useOptimisticAction } from '@/contexts/OptimisticActionContext';
import { api } from '@/trpc/react';
import { useRef } from 'react';
import { toast } from 'sonner';

const useTogglePinPost = ({
  postId,
  isPinned,
}: {
  postId: string;
  isPinned: boolean;
}) => {
  const utils = api.useUtils();

  const performAction = useOptimisticAction();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const isDirtyRef = useRef(false);

  const { mutate: togglePinPost } = api.post.togglePinPost.useMutation({
    onError: (err) => {
      if (performAction) {
        performAction(postId, 'PIN', isPinned);
      }
      toast.error('Failed to update pin status');
      isDirtyRef.current = false;
    },

    onSettled: () => {
      isDirtyRef.current = false;

      utils.user.getUserPosts.invalidate();
      utils.user.getUserVideoPosts.invalidate();
      utils.user.getUserImagePosts.invalidate();
    },
  });

  const togglePin = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    if (performAction) {
      performAction(postId, 'PIN', !isPinned);
      toast.success(isPinned ? 'Unpinned' : 'Pinned');
    }

    isDirtyRef.current = !isDirtyRef.current;

    timeoutRef.current = setTimeout(() => {
      if (isDirtyRef.current) {
        togglePinPost({ postId });
      }
    }, 1000);
  };

  return {
    togglePin,
  };
};

export default useTogglePinPost;
