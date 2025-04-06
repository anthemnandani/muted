'use client';

import { Follow } from '@/components/ui/follow-button';
import useFollowUser from '@/hooks/useFollowUser';
import type { AuthorInfoProps } from '@/lib/types';
import React from 'react';

interface FollowButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'default' | 'outline' | 'destructive';
  author: AuthorInfoProps;
  size: 'default' | 'sm' | 'lg' | 'icon';
}

const FollowButton: React.FC<FollowButtonProps> = ({
  variant,
  author,
  className,
  size,
}) => {
  const { handleToggleFollow, isLoading, isSameUser, isFollowedByMe } =
    useFollowUser({
      author,
    });

  return (
    <Follow
      disabled={isLoading || isSameUser}
      onClick={handleToggleFollow}
      size={size}
      variant={!isFollowedByMe ? variant : 'outline'}
      className={className}
    >
      {isFollowedByMe ? 'Following' : 'Follow'}
    </Follow>
  );
};

export default FollowButton;
