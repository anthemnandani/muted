'use client';

import useFollowUser from '@/hooks/useFollowUser';
import type { AuthorInfoProps } from '@/lib/types';
import { Check, Plus } from 'lucide-react';
import UserProfileCard from '../cards/UserProfileCard';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

const UserProfile = ({ author }: { author: AuthorInfoProps }) => {
  const { handleToggleFollow, isLoading, isSameUser, followUpdate } =
    useFollowUser({ author });

  return (
    <div className='relative'>
      <Dialog>
        <DialogTrigger asChild>
          <button className='relative' type='button'>
            <div className='size-14 outline outline-1 outline-border rounded-full relative'>
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
              <button
                type='button'
                onClick={handleToggleFollow}
                disabled={isLoading || isSameUser}
                className='absolute -bottom-2 left-1/2 -translate-x-1/2' // Added positioning classes
              >
                {followUpdate.current.isFollowedByMe ? (
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
        </DialogTrigger>
        <DialogContent className='!max-w-[360px] w-full p-0 rounded-2xl border-none'>
          <UserProfileCard {...author} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserProfile;
