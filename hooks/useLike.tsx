import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';

const useLike = ({
  initialLikesCount,
  likes,
  postId,
}: {
  initialLikesCount: number;
  likes: { userId: string }[];
  postId: string;
}) => {
  const { user: loggedUser } = useUser();
  const utils = api.useUtils();

  const isLikedByMeInitial = useMemo(
    () => likes?.some((like) => like.userId === loggedUser?.id) || false,
    [likes, loggedUser?.id]
  );

  const [isLikedByMe, setIsLikedByMe] = useState(isLikedByMeInitial);
  const [likesCount, setLikesCount] = useState(initialLikesCount || 0);

  useEffect(() => {
    setIsLikedByMe(isLikedByMeInitial);
    setLikesCount(initialLikesCount || 0);
  }, [isLikedByMeInitial, initialLikesCount]);

  const { mutate: toggleLike, isPending } = api.like.toggleLike.useMutation({
    onMutate: async () => {
      const previousIsLikedByMe = isLikedByMe;
      const previousLikesCount = likesCount;

      setIsLikedByMe((prev) => !prev);
      setLikesCount((prev) => (isLikedByMe ? prev - 1 : prev + 1));

      // await utils.post.getFollowingPosts.cancel();
      // const previousFollowingPosts =
      //   utils.post.getFollowingPosts.getInfiniteData();
      await utils.user.getUserReposts.cancel();
      const previousUserReposts = utils.user.getUserReposts.getInfiniteData();

      if (loggedUser?.id) {
        utils.user.getUserReposts.setInfiniteData(
          { username: loggedUser?.username! },
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData.pages.map((page) => ({
                ...page,
                posts: page.posts.map((post) => {
                  if (post.id !== postId) return post;

                  const willBeLiked = !previousIsLikedByMe;

                  return {
                    ...post,
                    likesCount: willBeLiked
                      ? post.likesCount + 1
                      : Math.max(0, post.likesCount - 1),
                    likes: willBeLiked
                      ? [...post.likes, { userId: loggedUser.id }]
                      : post.likes.filter((l) => l.userId !== loggedUser.id),
                  };
                }),
              })),
            };
          }
        );
      }

      return {
        previousIsLikedByMe,
        previousLikesCount,
        previousUserReposts,
      };
    },
    onError: (error, variables, context) => {
      if (context?.previousIsLikedByMe !== undefined) {
        setIsLikedByMe(context.previousIsLikedByMe);
        setLikesCount(context.previousLikesCount);
      }

      if (context?.previousUserReposts) {
        utils.user.getUserReposts.setInfiniteData(
          { username: loggedUser?.username! },
          context.previousUserReposts
        );
      }

      toast.error('Something went wrong!');
    },
    retry: false,
  });

  return {
    isLikedByMe,
    likesCount,
    toggleLike,
    isLoading: isPending,
  };
};

export default useLike;
