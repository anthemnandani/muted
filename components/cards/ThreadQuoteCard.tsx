'use client';

import React from 'react';
import { Card } from '@/components/ui/card';

import { api } from '@/trpc/react';
import { Icons } from '@/components/icons';
import type { ParentPostInfo } from '@/lib/types';
import Link from 'next/link';
import { formatTimeAgo } from '@/lib/utils';
import UserAvatar from '../shared/UserAvatar';
import Username from '../user/Username';

type ThreadQuoteCardProps = Partial<
  Pick<ParentPostInfo, 'id' | 'text' | 'author'>
> & { createdAt?: Date };

const ThreadQuoteCard: React.FC<
  ThreadQuoteCardProps & { quoteId?: string }
> = ({ author, text, quoteId, createdAt }) => {
  if (quoteId) {
    const { data, isLoading } = api.post.getQuotedPost.useQuery(
      { id: quoteId },
      {
        enabled: !!quoteId,
        staleTime: Infinity,
      }
    );
    if (isLoading) {
      return (
        <div className='h-[100px] w-full flex-center'>
          <Icons.loading className='size-11' />
        </div>
      );
    }

    if (!data) return <div>Not found</div>;

    return (
      <Link
        href={`/@${data.postInfo.user.username}/post/${data.postInfo.id}`}
        className='w-full'
      >
        <RenderCard
          author={data?.postInfo.user}
          text={data?.postInfo.text}
          createdAt={data.postInfo.createdAt}
        />
      </Link>
    );
  }
  return <RenderCard author={author} text={text} createdAt={createdAt} />;
};

export default ThreadQuoteCard;

const RenderCard: React.FC<ThreadQuoteCardProps> = ({
  author,
  text,
  createdAt,
}) => {
  return (
    <Card className='overflow-hidden p-4 mt-3 rounded-xl bg-transparent border-border w-full'>
      <div className='flex-between mb-1.5 '>
        <div className='flex items-center gap-2'>
          <UserAvatar
            fullname={author?.fullName}
            image={author?.image}
            username={author?.username ?? ''}
            className='h-7 w-7'
          />
          <Username author={author!} />
          <time className='text-[15px] text-gray-3 cursor-default'>
            {createdAt && formatTimeAgo(createdAt)}
          </time>
        </div>
      </div>
      {text && (
        <span className='flex-grow resize-none overflow-hidden outline-none text-[15px] text-accent-foreground break-words placeholder:text-gray-3 w-full tracking-normal whitespace-pre-line truncate'>
          <div
            dangerouslySetInnerHTML={{
              __html: text.replace(/\\n/g, '\n'),
            }}
          />
        </span>
      )}
    </Card>
  );
};
