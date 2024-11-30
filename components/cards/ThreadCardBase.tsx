'use client';

import { ThreadCardProps } from '@/lib/types';
import { cn, isImageOrVideo } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import PostHeader from '../posts/PostHeader';
import ThreadActions from '../shared/ThreadActions';
import ThreadText from '../shared/ThreadText';
import RepostedBy from '../user/RepostedBy';
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
  mentions,
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
  const pathname = usePathname();

  const handleContentClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (
      target.closest('.vjs-control') ||
      target.closest('.vjs-big-play-button') ||
      (target.tagName === 'VIDEO' && pathname !== '/')
    ) {
      e.preventDefault();
    }
  };

  const content = (
    <>
      {text && <ThreadText text={text} mentions={mentions} variant={variant} />}
      {media && media.fileType && (
        <>
          {isImageOrVideo(media.fileType) === 'image' && (
            <ThreadImageCard
              image={media.fileUrl as string}
              aspectRatio={media.aspectRatio}
              originalDimensions={media.originalDimensions}
            />
          )}
          {isImageOrVideo(media.fileType) === 'video' && (
            <ThreadVideoCard
              video={media.fileUrl! as string}
              aspectRatio={media.aspectRatio}
              originalDimensions={media.originalDimensions}
              username={author.username}
              postId={id}
            />
          )}
          {media.fileType === 'gif' && (
            <div className='relative px-4 overflow-hidden mt-2.5 mb-2'>
              <Image
                src={media.fileUrl as string}
                alt='GIF'
                width={200}
                height={200}
                loading='lazy'
              />
            </div>
          )}
        </>
      )}
      {quoteId && (
        <div className='px-10'>
          <ThreadQuoteCard quoteId={quoteId} />
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
        <PostHeader
          author={author}
          createdAt={createdAt}
          id={id}
          repostedBy={repostedBy}
          currentText={text ?? ''}
          variant={variant}
        />
      )}

      {variant === 'default' ? (
        <Link
          href={`/${author.username}/post/${id}`}
          className='w-full'
          onClick={handleContentClick}
        >
          {content}
        </Link>
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
