'use client';
import useLike from '@/hooks/useLike';
import { LikeButtonProps } from '@/lib/types';
import { cn, formatCount } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import React from 'react';
import { Icons } from '../icons';

const ThreadLikeButton: React.FC<LikeButtonProps> = ({
  likeInfo,
  authorId,
  hideLikes,
  isParentThread,
}) => {
  const { isLikedByMe, likesCount, toggleLike } = useLike({
    initialLikesCount: likeInfo.likesCount,
    likes: likeInfo.likes,
    id: likeInfo.id,
    type: 'THREAD',
  });

  const { user } = useUser();

  return (
    <div className='icon-container-hover'>
      <button
        type='button'
        aria-label={isLikedByMe ? 'Unlike' : 'Like'}
        onClick={toggleLike}
        className='flex items-center gap-2 z-[2] relative'
      >
        <Icons.heart
          fill={isLikedByMe ? '#ff3040' : 'transparent'}
          className={cn('size-5', {
            'text-primary-red': isLikedByMe,
          })}
        />
        {(!hideLikes || user?.id === authorId) &&
          likesCount > 0 &&
          !isParentThread && (
            <strong className='text-[13px] leading-4 text-center text-white/75'>
              {formatCount(likesCount)}
            </strong>
          )}
      </button>
    </div>
  );
};

export default ThreadLikeButton;
