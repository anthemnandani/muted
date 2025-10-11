import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { UserAvatarProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';

const UserAvatar: React.FC<UserAvatarProps> = ({
  username,
  image,
  fullname,
  className,
  showInfo = false,
}) => {
  return (
    <Link
      href={`/@${username}`}
      className={cn(
        'overflow-visible',
        showInfo ? 'size-7 inline-flex items-center gap-2' : 'size-9',
        className
      )}
    >
      <Avatar className='h-min w-full rounded-full object-cover flex-center'>
        <AvatarImage
          src={image ?? ''}
          alt={fullname ?? ''}
          className='rounded-full w-full h-full object-cover'
        />
        <AvatarFallback className='flex-center'>
          {username?.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      {showInfo && (
        <div className='leading-tight'>
          <p className='line-clamp-1 break-words truncate font-semibold text-sm text-white/90'>
            {fullname}
          </p>
          <p className='text-ellipsis line-clamp-1 break-words text-white/50'>
            @{username}
          </p>
        </div>
      )}
    </Link>
  );
};

export default UserAvatar;
