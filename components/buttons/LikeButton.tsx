'use client';

import useLike from '@/hooks/useLike';
import { LikeButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import React from 'react';
import { Icons } from '../icons';

const LikeButton: React.FC<LikeButtonProps> = ({
  likeInfo,
  authorId,
  hideLikes,
  isPanel,
}) => {
  const { isLikedByMe, likesCount, isLoading, toggleLike } = useLike({
    initialLikesCount: likeInfo.likesCount,
    likes: likeInfo.likes,
    postId: likeInfo.id,
  });

  const { user } = useUser();

  return (
    <div className={cn('flex flex-col items-center', isPanel && 'flex-row')}>
      <button
        type='button'
        // disabled={isLoading}
        aria-label={isLikedByMe ? 'Unlike' : 'Like'}
        onClick={() => toggleLike({ id: likeInfo.id })}
        className={cn(
          'btn-action mt-2 mb-1.5',
          isPanel && 'mt-0 mb-0 size-9 mr-1.5'
        )}
      >
        <Icons.heart
          fill={isLikedByMe ? '#ff3040' : '#fff '}
          className={cn('size-5', {
            'text-primary-red': isLikedByMe,
          })}
        />
      </button>

      {(!hideLikes || user?.id === authorId) && (
        <strong className='text-[13px] leading-4 text-center text-white/75'>
          {likesCount}
        </strong>
      )}
    </div>
  );
};

export default LikeButton;
