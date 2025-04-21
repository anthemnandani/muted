'use client';

import useLike from '@/hooks/useLike';
import { PostProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';
import { Icons } from '../icons';

interface LikeButtonProps {
  likeInfo: Pick<PostProps, 'id' | 'likes' | 'likesCount'>;
  hideLikes?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({ likeInfo, hideLikes }) => {
  const { isLikedByMe, likesCount, isLoading, toggleLike } = useLike({
    initialLikesCount: likeInfo.likesCount,
    likes: likeInfo.likes,
  });

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
      {/* {likesCount > 0 && !hideLikes && ( */}
      <strong className={cn('text-[13px] leading-4 text-center text-gray-2')}>
        {likesCount}
      </strong>
      {/* )} */}
    </div>
  );
};

export default LikeButton;
