'use client';

import { Follow } from '@/components/ui/follow-button';
import useFollowUser from '@/hooks/useFollowUser';
import { FollowButtonProps } from '@/lib/types';
import React from 'react';

const FollowButton: React.FC<FollowButtonProps> = ({
  variant,
  author,
  className,
  size,
  isNotification,
}) => {
  const { handleToggleFollow, isLoading, isSameUser, followStatus } =
    useFollowUser({
      author,
    });

  const getButtonText = () => {
    if (isNotification && followStatus === 'NOT_FOLLOWING') {
      return 'Follow back';
    }

    switch (followStatus) {
      case 'FOLLOWING':
        return isNotification ? 'Friends' : 'Following';
      case 'REQUESTED':
        return 'Requested';
      case 'NOT_FOLLOWING':
      default:
        return 'Follow';
    }
  };

  const getButtonVariant = () => {
    return followStatus === 'NOT_FOLLOWING' ? variant : 'outline';
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    handleToggleFollow();
  };

  return (
    <Follow
      disabled={isLoading || isSameUser}
      onClick={handleClick}
      size={size}
      variant={getButtonVariant()}
      className={className}
    >
      {getButtonText()}
    </Follow>
  );
};

export default FollowButton;
