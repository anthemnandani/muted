import { useHiddenPosts } from '@/store/hiddenPosts';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

interface UseToggleHidePostProps {
  postId: string;
  setIsOpen?: (open: boolean) => void;
}

export default function useToggleHidePost({
  postId,
  setIsOpen,
}: UseToggleHidePostProps) {
  const { hidePost, unhidePost } = useHiddenPosts();
  const trpcUtils = api.useUtils();

  const { mutateAsync: toggleHidePost, isLoading } =
    api.post.toggleHidePost.useMutation({
      onMutate: () => {
        setIsOpen?.(false);
        const isCurrentlyHidden = useHiddenPosts
          .getState()
          .isTemporarilyHidden(postId);
        isCurrentlyHidden ? unhidePost(postId) : hidePost(postId);
      },
      onError: () => {
        toast.error('Something went wrong!');
      },

      onSettled: async (data) => {
        toast.success(data?.hidden ? 'Hidden' : 'Unhidden');
        await Promise.all([
          trpcUtils.post.getNestedPosts.invalidate(),
          trpcUtils.user.postInfo.invalidate(),
          trpcUtils.user.repliesInfo.invalidate(),
          trpcUtils.user.repostsInfo.invalidate(),
        ]);
      },
    });

  return {
    handleToggleHidePost: toggleHidePost,
    isLoading,
  };
}
