import { useHiddenPosts } from '@/store/hiddenPosts';
import { api } from '@/trpc/react';
import { toast } from 'sonner';

const useToggleHidePost = ({ postId }: { postId: string }) => {
  const { hidePost, unhidePost, isTemporarilyHidden } = useHiddenPosts();

  const { mutateAsync: toggleHidePost, isLoading } =
    api.post.toggleHidePost.useMutation({
      onMutate: () => {
        const isCurrentlyHidden = isTemporarilyHidden(postId);
        isCurrentlyHidden ? unhidePost(postId) : hidePost(postId);
      },
      onError: () => {
        toast.error('Something went wrong!');
      },
      // onSettled: async (data) => {
      //   toast.success(data?.hidden ? 'Hidden' : 'Unhidden');
      //   await Promise.all([
      //     trpcUtils.post.getComments.invalidate(),
      //     trpcUtils.user.postInfo.invalidate(),
      //     trpcUtils.user.repliesInfo.invalidate(),
      //     trpcUtils.user.repostsInfo.invalidate(),
      //   ]);
      // },
    });

  return {
    handleToggleHidePost: toggleHidePost,
    isLoading,
  };
};

export default useToggleHidePost;
