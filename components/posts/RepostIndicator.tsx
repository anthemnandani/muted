'use client';

import { RepostIndicatorProps } from '@/lib/types';
import Image from 'next/image';
import React from 'react';
import RepostAvatars from './RepostAvatars';
import { cn } from '@/lib/utils';

const RepostIndicator: React.FC<RepostIndicatorProps> = ({
  repostedBy,
  isRepostedByMe,
  reposts,
}) => {
  const displayImage = isRepostedByMe
    ? isRepostedByMe?.user.image
    : repostedBy?.image;
  const displayName = isRepostedByMe ? 'You' : repostedBy?.fullName;
  const hasMultipleReposts = reposts.length > 1;

  return (
    <div
      className='inline-flex items-center gap-1.5 mb-3 px-2.5 py-1 rounded-full 
      bg-black/20 backdrop-blur-[2px] 
      border border-white/20 
      shadow-[0_2px_8px_-2px_rgba(0,0,0,0.3)]'
    >
      {hasMultipleReposts ? (
        <RepostAvatars reposts={reposts} />
      ) : (
        displayImage && (
          <div className='size-4 rounded-full overflow-hidden'>
            <Image
              src={displayImage}
              alt={displayName || ''}
              width={16}
              height={16}
              className='object-cover'
            />
          </div>
        )
      )}
      <span
        className={cn(
          'text-sm text-white font-medium',
          hasMultipleReposts && '-ml-1.5'
        )}
      >
        {displayName && displayName.length > 15
          ? `${displayName.slice(0, 15)}...`
          : displayName}{' '}
        reposted
      </span>
    </div>
  );
};

export default RepostIndicator;
