'use client';

import useFollowUser from '@/hooks/useFollowUser';
import type { AuthorInfoProps } from '@/lib/types';
import { Check, Plus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Link from 'next/link';

const UserProfile = ({ author }: { author: AuthorInfoProps }) => {
  const { handleToggleFollow, isLoading, isSameUser, isFollowedByMe } =
    useFollowUser({ author });

  return (
    <button className='relative' type='button'>
      <div className='size-14 outline outline-1 outline-border rounded-full relative'>
        <Link href={`/@${author.username}`}>
          <Avatar className='rounded-full w-full h-full'>
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
        <button
          type='button'
          onClick={handleToggleFollow}
          disabled={isLoading || isSameUser}
          className='absolute -bottom-2 left-1/2 -translate-x-1/2'
        >
          {isFollowedByMe ? (
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
