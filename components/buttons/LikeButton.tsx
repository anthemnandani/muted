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
}) => {
  const { isLikedByMe, likesCount, isLoading, toggleLike } = useLike({
    initialLikesCount: likeInfo.likesCount,
    likes: likeInfo.likes,
  });

  const { user } = useUser();

  return (
    <div className='flex flex-col items-center'>
      <button
        type='button'
        disabled={isLoading}
        title={isLikedByMe ? 'Unlike' : 'Like'}
        onClick={() => toggleLike({ id: likeInfo.id })}
        className='btn-action mt-2 mb-1.5'
      >
        <Icons.heart
          fill={isLikedByMe ? '#ff3040' : '#fff '}
          className={cn('size-5', {
            'text-primary-red': isLikedByMe,
          })}
        />
      </button>

      {(!hideLikes || user?.id === authorId) && (
        <strong className={cn('text-[13px] leading-4 text-center text-gray-2')}>
          {likesCount}
        </strong>
      )}
    </div>
  );
};

export default LikeButton;
