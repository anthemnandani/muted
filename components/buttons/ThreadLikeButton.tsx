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
  hideLikes?: boolean;
}

const ThreadLikeButton: React.FC<LikeButtonProps> = ({
  likeInfo,
  isParentPost,
  hideLikes,
}) => {
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

  const { mutate: toggleLike, isPending } = api.like.toggleLike.useMutation({
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
      await trpcUtils.thread.getInfiniteThreads.invalidate();
    },
  });

  return (
    <div className='icon-container-hover'>
      <button
        type='button'
        disabled={isPending}
        title={isLikedByMe ? 'Unlike' : 'Like'}
        onClick={() => toggleLike({ id })}
        className='flex items-center gap-2 z-[2] relative'
      >
        <Icons.heart
          fill={isLikedByMe ? '#ff3040' : 'transparent'}
          className={cn('size-5', {
            'text-primary-red': isLikedByMe,
          })}
        />
      </button>
      {likesCount > 0 && !hideLikes && !isParentPost && (
        <span
          className={cn(
            'text-[13px] ml-2',
            isLikedByMe && 'text-primary-red',
            !isLikedByMe && 'text-gray-4 dark:text-gray-2',
          )}
        >
          {likesCount}
        </span>
      )}
    </div>
  );
};

export default ThreadLikeButton;
