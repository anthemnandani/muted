import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const useLike = ({
  initialLikesCount,
  likes,
}: {
  initialLikesCount: number;
  likes: { userId: string }[];
}) => {
  const { user: loggedUser } = useUser();

  const isLikedByMeInitial =
    likes?.some((like) => like.userId === loggedUser?.id) || false;

  const [isLikedByMe, setIsLikedByMe] = useState(isLikedByMeInitial);
  const [likesCount, setLikesCount] = useState(initialLikesCount || 0);

  useEffect(() => {
    setIsLikedByMe(isLikedByMeInitial);
    setLikesCount(initialLikesCount || 0);
  }, [isLikedByMeInitial, initialLikesCount]);

  const trpcUtils = api.useUtils();

  const { mutate: toggleLike, isLoading } = api.like.toggleLike.useMutation({
    onMutate: async () => {
      setIsLikedByMe((prev) => !prev);
      setLikesCount((prev) => (isLikedByMe ? prev - 1 : prev + 1));

      return {
        previousIsLikedByMe: isLikedByMe,
        previousLikesCount: likesCount,
      };
    },
    onError: (error, variables, context) => {
      if (
        context?.previousIsLikedByMe !== undefined &&
        context?.previousLikesCount !== undefined
      ) {
        setIsLikedByMe(context.previousIsLikedByMe);
        setLikesCount(context.previousLikesCount);
      }
      toast.error('Something went wrong!');
    },
    onSuccess: async () => {
      await trpcUtils.post.getInfinitePosts.invalidate();
      await trpcUtils.post.getComments.invalidate();
      await trpcUtils.post.getLikedPosts.invalidate();
      await trpcUtils.user.getUserLikedPosts.invalidate();
      await trpcUtils.post.getPostsByTag.invalidate();
      await trpcUtils.post.getFollowingPosts.invalidate();
    },
  });
  return {
    isLikedByMe,
    likesCount,
    toggleLike,
    isLoading,
  };
};

export default useLike;
