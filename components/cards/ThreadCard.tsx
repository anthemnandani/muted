'use client';
import { ThreadCardProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import { Separator } from '../ui/separator';
import ThreadCardBase from './ThreadCardBase';

const ThreadCard: React.FC<ThreadCardProps> = ({
  isLastThread,
  showUsername,
  parentPost,
  ...props
}) => {
  return (
    <article className={cn('w-full pt-4', isLastThread && 'mb-20 md:mb-10')}>
      <ThreadCardBase {...props} variant='default'>
        {showUsername && parentPost?.author.username && (
          <div className='mt-1'>
            <Link
              href={`/@${parentPost?.author.username}/post/${parentPost?.id}`}
              className='text-gray-3 text-[15px] leading-5 px-2 md:px-4'
            >
              Replying to @{parentPost?.author.username}
            </Link>
          </div>
        )}
      </ThreadCardBase>
      {!isLastThread && !showUsername && <Separator />}
    </article>
  );
};

export default ThreadCard;
