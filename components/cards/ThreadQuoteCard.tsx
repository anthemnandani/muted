'use client';

import { Icons } from '@/components/icons';
import { Card } from '@/components/ui/card';
import { formatTimeAgo } from '@/lib/utils';
import { api } from '@/trpc/react';
import Link from 'next/link';
import React from 'react';
import UserAvatar from '../shared/UserAvatar';
import Username from '../user/Username';
import LinkPreviewCard from './LinkPreviewCard';
import type { ThreadInfo } from '@/lib/types';
import ThreadContent from './ThreadContent';

const ThreadQuoteCard: React.FC<ThreadInfo> = ({
  author,
  text,
  quoteId,
  media,
  mentions,
  createdAt,
  linkPreview,
}) => {
  if (quoteId) {
    const { data, isLoading } = api.thread.getQuotedThread.useQuery(
      { id: quoteId },
      {
        enabled: !!quoteId,
        staleTime: Infinity,
      },
    );
    if (isLoading) {
      return (
        <div className='h-[100px] w-full flex-center'>
          <Icons.loading className='size-11' />
        </div>
      );
    }

    if (!data) return null;

    const { id, user, text, media, createdAt, mentions, linkPreview } =
      data.threadInfo;

    return (
      <Link href={`/thread/${id}`} className='w-full'>
        <RenderCard
          author={user}
          text={text}
          media={media}
          createdAt={createdAt}
          mentions={mentions}
          linkPreview={linkPreview}
        />
      </Link>
    );
  }

  return (
    <RenderCard
      author={author}
      text={text}
      createdAt={createdAt}
      media={media}
      mentions={mentions}
      linkPreview={linkPreview}
    />
  );
};

export default ThreadQuoteCard;

const RenderCard: React.FC<ThreadInfo> = ({
  author,
  text,
  media,
  createdAt,
  mentions,
  linkPreview,
}) => {
  return (
    <Card className='overflow-hidden p-4 mt-3 mb-2 rounded-xl bg-transparent border-border w-full'>
      <div className='flex-between mb-1.5'>
        <div className='flex items-center gap-2'>
          <UserAvatar
            fullname={author?.fullName}
            image={author?.image}
            username={author?.username ?? ''}
            className='size-7'
          />
          <Username author={author!} />
          <time className='text-[15px] text-gray-3 cursor-default'>
            {createdAt && formatTimeAgo(createdAt)}
          </time>
        </div>
      </div>

      <ThreadContent
        text={text!}
        author={author!}
        media={media}
        mentions={mentions}
      />

      {linkPreview && (
        <div className='mx-2 my-2'>
          <LinkPreviewCard
            url={linkPreview.url}
            title={linkPreview.title}
            description={linkPreview.description}
            image={linkPreview.image}
          />
        </div>
      )}
    </Card>
  );
};
