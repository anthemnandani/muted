'use client';

import { Icons } from '@/components/icons';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { UserProfileInfoProps } from '@/lib/types';
import { cn, formatURL } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import { Privacy } from '@prisma/client';
import { Link2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';
import React from 'react';
import FollowButton from '../buttons/FollowButton';
import UserProfileMenu from '../menus/UserProfileMenu';
import EditProfile from '../modals/EditProfile';
import { Button } from '../ui/button';
import UserStats from './UserStats';

const UserProfile: React.FC<UserProfileInfoProps> = (props) => {
  const {
    id,
    bio,
    fullName,
    image,
    link,
    username,
    privacy,
    isAdmin,
    followers,
    following,
  } = props;
  const path = usePathname();
  const { user } = useUser();

  const params = useParams<{ username: string }>();
  const usernamePath = decodeURIComponent(params.username).substring(1);
  const basePath = `@${usernamePath}`;

  const segments = path.split('/');
  const lastSegment = segments[segments.length - 1];

  return (
    <div className='z-[10] mt-4 flex w-full flex-col space-y-4'>
      <div className='pt-2 px-4 md:px-5 pb-[10px]'>
        <div className='flex w-full items-center'>
          <div className='flex w-full flex-col p-3 pl-0 gap-1'>
            <h1 className='text-2xl leading-[30px] tracking-normal'>
              {fullName}
            </h1>
            <div className='flex gap-1'>
              <h4 className='text-[15px]'>{username}</h4>
            </div>
          </div>
          <Avatar className='size-20 overflow-visible outline outline-2 outline-border relative'>
            <AvatarImage
              src={image || ''}
              alt={fullName || ''}
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

        <p className='text-[15px] whitespace-pre-line mt-6'>{bio}</p>
        {link && (
          <div className='flex flex-wrap items-center gap-x-3 pt-1'>
            <div className='group flex hover:cursor-pointer'>
              <Link href={link} target='_blank' rel='noreferrer'>
                <Link2 className='inline h-4 w-4 stroke-sky-600' />
                <span className='ml-2 break-all text-sm text-sky-600 group-hover:text-sky-500'>
                  {formatURL(link)}
                </span>
              </Link>
            </div>
          </div>
        )}
        <div className='flex-between mt-3'>
          <UserStats
            username={username}
            following={following.length}
            followers={followers.length}
          />
          {user?.id != id && <UserProfileMenu />}
        </div>
      </div>

      <div className='py-3 px-6 !mt-2'>
        {user?.id != id && (
          <div className='grid gap-2 sm:grid-cols-2 pt-2'>
            <FollowButton
              className='text-[14px] px-6'
              variant='default'
              author={props}
            />
            <Button
              size='sm'
              variant='outline'
              className='w-full border-[#333333] sm:w-auto rounded-xl cursor-not-allowed py-1 font-semibold tracking-normal active:scale-95 '
            >
              Mention
            </Button>
          </div>
        )}
        {user?.id === id && (
          <EditProfile
            userBio={bio || ''}
            userLink={link || ''}
            userImage={image || ''}
            userPrivacy={privacy as Privacy}
          />
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
