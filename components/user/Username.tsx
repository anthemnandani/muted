import { UsernameProps } from '@/lib/types';
import { cn, formatRepostTime } from '@/lib/utils';
import Link from 'next/link';
import { Fragment } from 'react';
import UserProfileCard from '../cards/UserProfileCard';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';

const Username: React.FC<UsernameProps> = ({
  author,
  isReposted,
  repostedAt,
  className,
  isComment,
  isSearch,
  postAuthorId,
  isMention = false,
}) => {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Link
          href={`/@${author.username}`}
          className={cn(
            'inline-flex items-center gap-1.5 w-fit',
            isSearch && 'max-w-[80%]',
          )}
        >
          <span
            className={cn(
              'text-white/90 text-[14px] font-semibold hover:underline',
              isReposted && 'text-[13px] text-gray-3',
              className,
            )}
          >
            {isMention && '@'}
            {author.username}{' '}
          </span>
          {isComment && author?.id === postAuthorId && (
            <Fragment>
              <span className='text-white/50 inline-block align-middle'>
                &middot;
              </span>
              <span className='text-[14px] text-primary-blue font-semibold'>
                Creator
              </span>
            </Fragment>
          )}
          {isReposted && (
            <span className='text-[13px] text-gray-3'>
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
