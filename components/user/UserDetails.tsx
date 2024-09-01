'use client';

import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { UserProfileInfoProps } from '@/lib/types';
import { cn, formatURL } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import React from 'react';
// import UserFollowers from '@/components/user/user-followers';
// import FollowButton from '@/components/buttons/follow-button';

const UserProfile: React.FC<UserProfileInfoProps> = (props) => {
  const { id, bio, fullName, image, link, username, followers, isAdmin } =
    props;
  const path = usePathname();
  const { user } = useUser();

  const params = useParams<{ username: string }>();
  const usernamePath = decodeURIComponent(params.username).substring(1);
  const basePath = `@${usernamePath}`;

  const segments = path.split('/');
  const lastSegment = segments[segments.length - 1];

  return (
    <div className='z-[10] mt-4 flex w-full flex-col space-y-4'>
      <div className='pt-4 px-5 pb-[10px]'>
        <div className='flex w-full items-center'>
          <div className='flex w-full flex-col p-3 pl-0 gap-1'>
            <h1 className='text-2xl tracking-normal'>{fullName}</h1>
            <div className='flex gap-1'>
              <h4 className='text-[15px]'>{username}</h4>
            </div>
          </div>
          <Avatar className='h-[80px] w-[80px] overflow-visible outline outline-2 outline-border relative'>
            <AvatarImage
              src={image ?? ''}
              alt={fullName ?? ''}
              className='h-min w-full rounded-full object-cover '
            />
            <AvatarFallback></AvatarFallback>
            {isAdmin && (
              <div className='absolute bottom-0 -left-0.5'>
                <Icons.verified2 className='h-6 w-6 text-background' />
              </div>
            )}
          </Avatar>
        </div>

        {bio && <span className='text-[15px] whitespace-pre-line'>{bio}</span>}

        <div className='flex-between'>
          <div className='hidden sm:flex -space-x-1 overflow-hidden w-full items-center '>
            <div className='flex items-center'>
              {/* <UserFollowers followers={followers} showImage={true} /> */}

              {followers.length > 0 && link && (
                <span className='mx-2 text-gray-3'> · </span>
              )}

              {link && (
                <Link
                  href={link}
                  className='text-gray-3 text-[15px] hover:underline cursor-pointer active:text-[#4d4d4d]'
                >
                  {formatURL(link)}
                </Link>
              )}
            </div>
          </div>
        </div>
        {/* {user?.id != id && (
          <div className='grid gap-2 sm:grid-cols-2 pt-2'>
            <FollowButton
            className='text-[14px] px-6'
            variant='default'
            author={props}
          />
            <Button
              size={'sm'}
              variant='outline'
              className='w-full border-[#333333] sm:w-auto rounded-xl cursor-not-allowed py-1 font-semibold tracking-normal text-[16px] active:scale-95 '
            >
              Mention
            </Button>
          </div>
        )} */}
      </div>
      <div className='py-4 px-6'>
        {user?.id === id && (
          <Button
            variant='ghost'
            className='w-full rounded-[10px] border border-border-dark dark:border-border-light hover:bg-transparent dark:hover:bg-transparent'
          >
            Edit Profile
          </Button>
        )}
      </div>
      <div className='w-full flex border-b border-border'>
        <Link
          href={`/${basePath}`}
          className={cn(
            'flex-center w-full h-12 font-medium duration-200 text-centertext-neutral-600',
            {
              'border-b-2 border-foreground text-foreground':
                lastSegment === basePath,
            }
          )}
        >
          Threads
        </Link>
        <Link
          href={`/${basePath}/replies`}
          className={cn(
            'flex-center w-full h-12 font-medium duration-200 text-centertext-neutral-600',
            {
              'border-b-2 border-foreground text-foreground':
                lastSegment === 'replies',
            }
          )}
        >
          Replies
        </Link>
        <Link
          href={`/${basePath}/reposts`}
          className={cn(
            'flex-center w-full h-12 font-medium duration-200 text-centertext-neutral-600',
            {
              'border-b-2 border-foreground text-foreground':
                lastSegment === 'reposts',
            }
          )}
        >
          Reposts
        </Link>
      </div>
    </div>
  );
};

export default UserProfile;
