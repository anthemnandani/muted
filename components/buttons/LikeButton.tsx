'use client';
import { PostProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import React from 'react';
import { toast } from 'sonner';
import { Icons } from '../icons';

interface LikeButtonProps {
  likeInfo: Pick<PostProps, 'id' | 'likes' | 'likesCount'>;
  isParentPost?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({ likeInfo, isParentPost }) => {
  const { user: loggedUser } = useUser();

  const { likesCount: initialLikesCount, id, likes } = likeInfo;
  const isLikedByMeInitial =
    likes?.some((like) => like.userId === loggedUser?.id) || false;

  const [isLikedByMe, setIsLikedByMe] = React.useState(isLikedByMeInitial);
  const [likesCount, setLikesCount] = React.useState(initialLikesCount || 0);

  React.useEffect(() => {
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
      await trpcUtils.post.getNestedPosts.invalidate();
      await trpcUtils.post.getLikedPosts.invalidate();
    },
  });

  return (
    <div className='flex-center hover:bg-primary rounded-full p-2 w-fit h-fit active:scale-95'>
      <button
        type='button'
        disabled={isLoading}
        title={isLikedByMe ? 'Unlike' : 'Like'}
        onClick={() => toggleLike({ id })}
      >
        <Icons.heart
          fill={isLikedByMe ? '#ff3040' : 'transparent'}
          className={cn('size-5', {
            'text-primary-red': isLikedByMe,
          })}
        />
      </button>
      {likesCount > 0 && !isParentPost && (
        <span
          className={cn(
            'text-[13px] ml-2',
            isLikedByMe && 'text-primary-red',
            !isLikedByMe && 'text-gray-4 dark:text-gray-2'
          )}
        >
          {likesCount}
        </span>
      )}
    </div>
  );
};

export default LikeButton;
