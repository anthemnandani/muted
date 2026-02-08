'use client';

import useFollowUser from '@/hooks/useFollowUser';
import type { AuthorInfoProps, AuthorProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Check, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Link from 'next/link';

interface UserProfileProps {
  author: AuthorInfoProps | AuthorProps;
  showFollowButton?: boolean;
  avatarSize?: string;
  className?: string;
}

const UserProfile = ({
  author,
  showFollowButton = true,
  avatarSize = 'size-12',
  className,
}: UserProfileProps) => {
  const { handleToggleFollow, isLoading, isSameUser, followStatus } =
    useFollowUser({ author });

  const AvatarContent = (
    <Link href={`/@${author.username}`}>
      <Avatar className={cn('rounded-full w-full h-full', avatarSize)}>
        <AvatarImage
          src={author?.image ?? ''}
          alt={author?.username}
          className='object-cover'
        />
        <AvatarFallback>
          {author?.username?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
    </Link>
  );

  if (!showFollowButton) {
    return (
      <div className={cn('relative', avatarSize, className)}>
        {AvatarContent}
      </div>
    );
  }

  return (
    <button className={cn('relative mb-3', className)} type='button'>
      <div
        className={cn(
          'outline outline-1 outline-border rounded-full relative',
          avatarSize,
        )}
      >
        {AvatarContent}

        <button
          type='button'
          onClick={handleToggleFollow}
          disabled={isLoading || isSameUser}
          className='absolute -bottom-2 left-1/2 -translate-x-1/2 z-10'
        >
          {followStatus === 'FOLLOWING' ? (
            <div className='bg-black rounded-2xl cursor-pointer hover:scale-105 active:scale-95'>
              <Check className='size-[22px] p-0.5 text-primary-red' />
            </div>
          ) : (
            <div className='bg-primary-red rounded-2xl cursor-pointer hover:scale-105 active:scale-95'>
              <Plus className='size-[22px] p-0.5 text-white' />
            </div>
          )}
        </button>
      </div>
    </button>
  );
};

export default UserProfile;
