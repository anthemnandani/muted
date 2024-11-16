'use client';

import { ThreadCardProps } from '@/lib/types';
import { cn, formatTimeAgo, isImageOrVideo } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import ThreadActionMenu from '../menus/ThreadActionMenu';
import UserProfile from '../modals/UserProfile';
import ThreadActions from '../shared/ThreadActions';
import RepostedBy from '../user/RepostedBy';
import Username from '../user/Username';
import ThreadImageCard from './ThreadImageCard';
import ThreadQuoteCard from './ThreadQuoteCard';
import ThreadVideoCard from './ThreadVideoCard';

interface ThreadCardBaseProps extends ThreadCardProps {
  variant?: 'default' | 'reply';
  showHeader?: boolean;
  showActions?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const ThreadCardBase: React.FC<ThreadCardBaseProps> = ({
  id,
  text,
  createdAt,
  author,
  media,
  quoteId,
  repostedBy,
  repostedAt,
  likes,
  likesCount,
  reposts,
  repostsCount,
  bookmarks,
  bookmarksCount,
  repliesCount,
  variant = 'default',
  showHeader = true,
  showActions = true,
  className,
  children,
}) => {
  const content = (
    <>
      {text && (
        <Link href={`/${author.username}/post/${id}`}>
          <div
            dangerouslySetInnerHTML={{
              __html: text.replace(/\\n/g, '\n'),
            }}
            className={cn(
              'text-accent-foreground text-[15px] leading-5 whitespace-pre-line px-2 md:px-4 my-3',
              variant === 'reply' && 'max-md:max-w-full'
            )}
          />
        </Link>
      )}

      {media && media.fileType && (
        <>
          {isImageOrVideo(media.fileType) === 'image' && (
            <Link href={`/${author.username}/post/${id}`}>
              <ThreadImageCard
                image={media.fileUrl}
                aspectRatio={media.aspectRatio}
                originalDimensions={media.originalDimensions}
              />
            </Link>
          )}
          {isImageOrVideo(media.fileType) === 'video' && (
            <ThreadVideoCard
              video={media.fileUrl!}
              aspectRatio={media.aspectRatio}
              originalDimensions={media.originalDimensions}
              username={author.username}
              postId={id}
            />
          )}
        </>
      )}
      {quoteId && (
        <div className='px-10'>
          <Link href={`/${author.username}/post/${quoteId}`}>
            <ThreadQuoteCard quoteId={quoteId} />
          </Link>
        </div>
      )}
    </>
  );

  return (
    <div className={cn('mb-3', className)}>
      {repostedBy && (
        <RepostedBy repostedBy={repostedBy} repostedAt={repostedAt} />
      )}

      {showHeader && (
        <div className='flex-between gap-5 py-px w-full max-md:max-w-full max-md:flex-wrap px-2 md:px-4'>
          <div className='flex items-center gap-2'>
            <UserProfile author={author} />
            {variant === 'reply' ? (
              <>
                <Username author={author} />
                <time className='text-[15px] leading-none text-gray-3'>
                  {formatTimeAgo(createdAt)}
                </time>
              </>
            ) : (
              <Username author={author} />
            )}
          </div>
          <ThreadActionMenu
            authorId={author.id}
            postId={id}
            repostedBy={repostedBy}
          />
        </div>
      )}

      {variant === 'default' ? (
        <div className='w-full'>{content}</div>
      ) : (
        content
      )}

      {showActions && (
        <div className='pt-2 flex-between w-full px-2 md:px-4'>
          <ThreadActions
            id={id}
            likesCount={likesCount ?? 0}
            likes={likes}
            text={text}
            author={author}
            createdAt={createdAt}
            repliesCount={repliesCount ?? 0}
            repostsCount={repostsCount ?? 0}
            reposts={reposts}
            bookmarksCount={bookmarksCount ?? 0}
            bookmarks={bookmarks}
          />
        </div>
      )}

      {children}
    </div>
  );
};

export default ThreadCardBase;
