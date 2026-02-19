import { useHiddenPosts } from '@/store/hiddenPosts';
import { api } from '@/trpc/react';
import { useRef } from 'react';
import { toast } from 'sonner';

const useToggleHidePost = ({ postId }: { postId: string }) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);
  const { isPostHidden, hidePost, unhidePost } = useHiddenPosts();
  const isHidden = isPostHidden(postId);

  const { mutate: toggleHidePost } = api.post.toggleHidePost.useMutation({
    onError: (err) => {
      if (isHidden) {
        unhidePost(postId);
      } else {
        hidePost(postId);
      }
      toast.error('Failed to update post visibility');
      isDirtyRef.current = false;
    },

    onSettled: () => {
      isDirtyRef.current = false;
    },
  });

  const toggleHide = (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    if (isHidden) {
      unhidePost(postId);
      toast.success('Unhidden');
    } else {
      hidePost(postId);
      toast.success('Hidden');
    }

    isDirtyRef.current = !isDirtyRef.current;

    timeoutRef.current = setTimeout(() => {
      if (isDirtyRef.current) {
        toggleHidePost({ postId });
      }
    }, 1000);
  };

  return {
    toggleHide,
  };
};

export default useToggleHidePost;
