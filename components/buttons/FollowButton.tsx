'use client';

import { Follow } from '@/components/ui/follow-button';
import useFollowUser from '@/hooks/useFollowUser';
import type { AuthorInfoProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import React from 'react';

interface FollowButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'default' | 'outline';
  author: AuthorInfoProps;
}

const FollowButton: React.FC<FollowButtonProps> = ({
  variant,
  author,
  className,
}) => {
  const { handleToggleFollow, isLoading, isSameUser, isFollowedByMe } =
    useFollowUser({
      author,
    });

  return (
    <Follow
      disabled={isLoading || isSameUser}
      onClick={handleToggleFollow}
      variant={!isFollowedByMe ? variant : 'outline'}
      className={cn(
        'rounded-[10px] px-6 !text-[14px] py-1.5 h-8 select-none',
        className,
        {
          'opacity-80': isFollowedByMe,
        }
      )}
    >
      {isFollowedByMe ? 'Following' : 'Follow'}
    </Follow>
  );
};

export default FollowButton;
