'use client';

import useLike from '@/hooks/useLike';
import { LikeButtonProps } from '@/lib/types';
import { cn, formatCount } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import React from 'react';
import { Icons } from '../icons';

const LikeButton: React.FC<LikeButtonProps> = ({
  likeInfo,
  authorId,
  hideLikes,
  isPanel,
  isMainFeed,
}) => {
  const { isLikedByMe, likesCount, toggleLike } = useLike({
    initialLikesCount: likeInfo.likesCount,
    likes: likeInfo.likes,
    id: likeInfo.id,
    type: 'POST',
  });

  const { user } = useUser();

  const showLikesCount =
    (isMainFeed && likesCount > 0) ||
    (!isMainFeed && !hideLikes) ||
    user?.id === authorId;

  return (
    <div
      className={cn(
        'flex flex-col items-center',
        (isPanel || isMainFeed) && 'flex-row',
      )}
    >
      <button
        aria-label={isLikedByMe ? 'Unlike' : 'Like'}
        onClick={toggleLike}
        className={cn(
          isMainFeed
            ? 'hover:scale-110 transition-transform mr-1.5'
            : 'btn-action mt-2 mb-1.5',
          isPanel && 'mt-0 mb-0 size-9 mr-1.5',
        )}
      >
        <Icons.heart
          fill={isLikedByMe ? '#ff3040' : isMainFeed ? 'none' : '#fff '}
          className={cn(
            isLikedByMe && 'text-primary-red',
            isMainFeed ? 'size-6' : 'size-5',
          )}
          stroke={isMainFeed && !isLikedByMe ? 'currentColor' : 'none'}
          strokeWidth={isMainFeed && !isLikedByMe ? 2 : 0}
        />
      </button>

      {showLikesCount && (
        <strong className='text-[13px] font-semibold leading-4 text-center text-white/90'>
          {formatCount(likesCount)}
        </strong>
      )}
    </div>
  );
};

export default LikeButton;
