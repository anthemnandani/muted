import type { AuthorInfoProps } from '@/lib/types';
import Link from 'next/link';
import React from 'react';
import UserProfileCard from '../cards/UserProfileCard';
import { Icons } from '../icons';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

interface UsernameProps {
  author: AuthorInfoProps;
}

const Username: React.FC<UsernameProps> = ({ author }) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link
          href={`/@${author.username}`}
          className='flex-center gap-1.5 cursor-pointer hover:underline w-fit'
        >
          <h1 className='text-accent-foreground text-[15px] font-semibold leading-[0]'>
            {author.username}
          </h1>
          {author.isAdmin && <Icons.verified className='w-3 h-3' />}
        </Link>
      </HoverCardTrigger>
      <HoverCardContent
        align='start'
        sideOffset={10}
        className='w-[360px] p-0 z-[9999] rounded-2xl bg-transparent border-gray-1 dark:border-gray-5'
      >
        <UserProfileCard {...author} />
      </HoverCardContent>
    </HoverCard>
  );
};

export default Username;
