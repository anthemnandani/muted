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
}) => {
  return (
    <Link
      href={`/@${username}`}
      className={cn(
        'size-9 overflow-visible outline outline-[1.5px] outline-border rounded-full',
        className
      )}
    >
      <Avatar className='h-min w-full rounded-full object-cover flex-center'>
        <AvatarImage
          src={image ?? ''}
          alt={fullname ?? ''}
          className='rounded-full w-full h-full object-cover'
        />
        <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
      </Avatar>
    </Link>
  );
};

export default UserAvatar;
