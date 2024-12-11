import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { UserCardProps } from '@/lib/types';
import Link from 'next/link';
import React from 'react';
import FollowButton from '../buttons/FollowButton';
import Username from '../user/Username';

const UserCard: React.FC<UserCardProps> = ({
  id,
  bio,
  fullName,
  createdAt,
  image,
  link,
  isAdmin,
  username,
  followers,
  following,
}) => {
  return (
    <div className='flex flex-col w-full px-6'>
      <div className='flex w-full mt-5'>
        <Link href={`/@${username}`}>
          <Avatar className='h-10 w-10 relative overflow-visible cursor-pointer outline outline-1 outline-border '>
            <AvatarImage
              src={image ?? ''}
              alt={fullName ?? ''}
              className='rounded-full object-cover'
            />
            <AvatarFallback>
              {username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className='flex flex-col w-full ml-3'>
          <div className='flex justify-between w-full'>
            <Link
              href={`/@${username}`}
              className='flex flex-col gap-1.5 w-full'
            >
              <div className='flex flex-col w-full'>
                <span className='font-semibold'>{fullName}</span>
                <Username
                  author={{
                    id,
                    image,
                    createdAt,
                    username,
                    fullName,
                    isAdmin,
                    link,
                    bio,
                    followers,
                    following,
                  }}
                  className='text-sm text-gray-3'
                  addAt
                />
              </div>
            </Link>
            <FollowButton
              className='text-[14px] rounded-full py-5 !h-0'
              variant='outline'
              author={{
                id,
                image,
                createdAt,
                username,
                fullName,
                isAdmin,
                link,
                bio,
                followers,
                following,
              }}
            />
          </div>
        </div>
      </div>
      <Separator className='mt-4' />
    </div>
  );
};

export default UserCard;
