'use client';
import { getUsername } from '@/lib/utils';
import { api } from '@/trpc/react';
import { useUser } from '@clerk/nextjs';
import { useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Button } from '../ui/button';
import { Separator } from '../ui/separator';

const CreateWithInput = ({ onClick }: { onClick: () => void }) => {
  const { user } = useUser();
  const username = useMemo(() => getUsername(user!), [user]) as string;
  const { data, isLoading } = api.user.userInfo.useQuery({ username });
  return (
    <div className='flex flex-col w-full select-none' onClick={onClick}>
      <div className='flex w-full my-4 px-6 py-2'>
        <div className='w-full flex select-none'>
          <Avatar className='rounded-full outline outline-1 outline-border h-9 w-9 mr-4'>
            <AvatarImage
              src={isLoading ? user?.imageUrl : data?.userDetails?.image!}
              alt={username ?? ''}
              className='object-cover'
            />
            <AvatarFallback>
              {username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <input
            className='resize-none bg-transparent w-full placeholder:text-gray-3 outline-none placeholder:text-[15px]'
            placeholder='Start a thread...'
          />
        </div>
        <Button
          variant='ghost'
          className='bg-transparent border border-border-dark dark:border-border-light rounded-lg text-[14px] leading-none flex-center hover:bg-transparent dark:hover:bg-transparent'
        >
          Post
        </Button>
      </div>
      <Separator />
    </div>
  );
};

export default CreateWithInput;
