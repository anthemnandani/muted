'use client';

import { Icons } from '@/components/icons';
import { useRepost } from '@/hooks/useRepost';
import type { RepostButtonProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';

const RepostButton: React.FC<RepostButtonProps> = ({
  id,
  reposts,
  repostsCount: initialRepostsCount,
}) => {
  const { isRepostedByMe, repostsCount, isLoading, handleToggleRepost } =
    useRepost({
      reposts,
      initialRepostsCount,
      postId: id,
    });

  return (
    <div className='flex flex-col items-center'>
      <button
        type='button'
        disabled={isLoading}
        title={isRepostedByMe ? 'Remove Repost' : 'Repost'}
        onClick={handleToggleRepost}
        className='btn-action mt-2 mb-1.5'
      >
        {isRepostedByMe ? (
          <Icons.reposted className='size-5' />
        ) : (
          <Icons.repost className='size-5' />
        )}
      </button>

      <strong className={cn('text-[13px] leading-4 text-center text-gray-2')}>
        {repostsCount}
      </strong>
    </div>
  );
};

export default RepostButton;
