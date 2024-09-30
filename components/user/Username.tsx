import type { AuthorInfoProps } from '@/lib/types';
import { cn, formatRepostTime } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import UserProfileCard from '../cards/UserProfileCard';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

interface UsernameProps {
  author: AuthorInfoProps;
  isReposted?: boolean;
  repostedAt?: Date;
}

const Username: React.FC<UsernameProps> = ({
  author,
  isReposted,
  repostedAt,
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link
          href={`/@${author.username}`}
          className='flex-center gap-1.5 w-fit group'
        >
          <span
            className={cn(
              'text-accent-foreground text-[15px] font-semibold leading-[0] group-hover:underline',
              isReposted && 'text-[13px] text-[#999] dark:text-gray-3'
            )}
          >
            {author.username}
          </span>
          {isReposted && (
            <span className='text-[13px] text-[#999] dark:text-gray-3'>
              reposted {formatRepostTime(repostedAt!)}
            </span>
          )}

          {/* {author.isAdmin && <Icons.verified className='w-3 h-3' />} */}
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
