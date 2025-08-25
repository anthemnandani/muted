import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import type { UserCardProps } from '@/lib/types';
import { cn, formatCount } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import FollowButton from '../buttons/FollowButton';
import Username from '../user/Username';

const UserCard: React.FC<UserCardProps> = (props) => {
  const {
    id,
    privacy,
    createdAt,
    isAdmin,
    link,
    following,
    username,
    fullName,
    image,
    bio,
    followers,
    isLastUser,
    showDetails,
  } = props;

  const authorProps = {
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
    privacy,
  };

  return (
    <Link
      href={`/@${username}`}
      className={cn('flex flex-col w-full', isLastUser && 'mb-20 md:mb-10')}
    >
      <div className='flex w-full mt-5'>
        <Avatar className='size-10 relative overflow-visible cursor-pointer outline outline-1 outline-border'>
          <AvatarImage
            src={image ?? ''}
            alt={fullName ?? ''}
            className='rounded-full object-cover'
          />
          <AvatarFallback>{username.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className='flex flex-col w-full ml-3'>
          <div className='flex justify-between w-full pb-1 pr-2 md:pr-4'>
            <div className='flex flex-col gap-1.5 w-full'>
              <div className='flex flex-col w-full'>
                <Username
                  author={authorProps}
                  className='text-[15px] text-black dark:text-[#f3f5f7] font-semibold'
                />
                <span className='text-[15px] text-[#999] dark:text-gray-3 antialiased break-words text-ellipsis'>
                  {fullName}
                </span>
              </div>
            </div>
            <FollowButton
              size='default'
              variant='outline'
              author={authorProps}
              className='rounded-[10px] px-6 !text-[14px] py-1.5 h-8 select-none'
            />
          </div>
          {showDetails && bio && (
            <span className='text-[15px] text-black dark:text-[#f3f5f7] line-clamp-3 w-full whitespace-pre-line break-words antialiased pr-2 md:pr-4'>
              {bio}
            </span>
          )}

          {showDetails && (
            <Link
              href={`/@${username}/followers`}
              className='text-[15px] text-[#999] dark:text-gray-3 mt-2'
            >
              {formatCount(followers.length)} follower
              {followers.length !== 1 ? 's' : ''}
            </Link>
          )}

          {!isLastUser && <Separator className='mt-4' />}
        </div>
      </div>
    </Link>
  );
};

export default UserCard;
