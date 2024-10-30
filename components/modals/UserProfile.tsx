'use client';

import { Author } from '@/lib/types';
import { Plus } from 'lucide-react';
import UserProfileCard from '../cards/UserProfileCard';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';

const UserProfile = ({ author }: { author: Author }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className='relative' type='button'>
          <div className='size-9 outline outline-1 outline-border rounded-full'>
            <Avatar className='rounded-full w-full h-full '>
              <AvatarImage
                src={author?.image ?? ''}
                alt={author?.username}
                className='object-cover'
              />
              <AvatarFallback>
                {author?.username?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className='bg-foreground absolute -bottom-0.5 -right-0.5 rounded-2xl border-2 border-background text-background hover:scale-105 active:scale-95'>
            <Plus className='size-4 p-0.5 text-white dark:text-black' />
          </div>
        </button>
      </DialogTrigger>
      <DialogContent className='!max-w-[360px] w-full p-0 rounded-2xl border-none'>
        <UserProfileCard {...author} />
      </DialogContent>
    </Dialog>
  );
};

export default UserProfile;
