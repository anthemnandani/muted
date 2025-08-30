'use client';

import { PostInfoCardProps } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';
import { useState } from 'react';
import FollowButton from '../buttons/FollowButton';
import ParsedText from '../shared/ParsedText';
import RepostBanner from '../shared/RepostBanner';
import { Avatar, AvatarImage } from '../ui/avatar';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '../ui/hover-card';
import UserProfileCard from './UserProfileCard';

const PostInfoCard: React.FC<PostInfoCardProps> = ({
  postText,
  author,
  createdAt,
  reposts,
  repostedBy,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const maxLength = 40;
  const isTextLong = postText.length > maxLength;

  const displayText = isExpanded
    ? postText
    : isTextLong
    ? `${postText.substring(0, maxLength)}...`
    : postText;

  return (
    <div className='bg-white/5 p-4 mb-4 rounded-xl'>
      <div className='relative flex items-center mb-[15px]'>
        <Avatar className='rounded-full size-10 mr-3'>
          <AvatarImage
            src={author?.image ?? ''}
            alt={author?.username}
            className='object-cover'
          />
        </Avatar>
        <HoverCard>
          <HoverCardTrigger asChild>
            <Link
              href={`/@${author.username}`}
              className='text-ellipsis overflow-hidden whitespace-nowrap mr-3 flex-[1_1_auto] text-white/90 group'
            >
              <span className='block text-[18px] leading-6 font-bold text-ellipsis overflow-hidden whitespace-nowrap group-hover:underline'>
                {author.username}{' '}
              </span>
              <div className='flex items-center gap-1'>
                <span className='text-white/90 text-sm'>{author.fullName}</span>
                <span> · </span>
                <span className='text-white/90 text-sm'>
                  {formatTimeAgo(createdAt)}
                </span>
              </div>
            </Link>
          </HoverCardTrigger>
          <HoverCardContent
            align='start'
            sideOffset={10}
            className='w-[360px] p-0 z-[9999] rounded-2xl bg-transparent border-gray-5'
          >
            <UserProfileCard {...author} />
          </HoverCardContent>
        </HoverCard>

        <FollowButton
          className='inline-flex items-center justify-center min-w-24 
          relative border border-solid border-primary-blue h-9 p-[15px_1px] bg-primary-blue 
          hover:bg-primary-blue/90 transition-colors duration-200 !text-white rounded-sm
        '
          author={author}
          variant='default'
          size='sm'
        />
      </div>
      <div className='mb-3'>
        <p className='text-white text-base antialiased whitespace-pre-line break-words'>
          <ParsedText text={displayText!.replace(/\\n/g, '\n')} />
          {isTextLong && !isExpanded && (
            <button
              onClick={() => setIsExpanded(true)}
              className='text-gray-400 hover:text-primary-blue ml-1 font-medium'
            >
              more
            </button>
          )}
        </p>
        {isExpanded && (
          <button
            onClick={() => setIsExpanded(false)}
            className='text-gray-400 hover:text-primary-blue text-sm mt-1 font-medium'
          >
            less
          </button>
        )}
      </div>
      <RepostBanner repostedBy={repostedBy} reposts={reposts} />
    </div>
  );
};

export default PostInfoCard;
