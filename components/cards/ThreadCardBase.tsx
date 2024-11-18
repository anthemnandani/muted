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
import { usePathname } from 'next/navigation';

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
      {text && (
        <div
          dangerouslySetInnerHTML={{
            __html: text.replace(/\\n/g, '\n'),
          }}
          className={cn(
            'text-accent-foreground text-[16px] font-normal leading-[1.4em] antialiased whitespace-pre-line px-2 md:px-4 my-3',
            variant === 'reply' && 'max-md:max-w-full'
          )}
        />
      )}
      {media && media.fileType && (
        <>
          {isImageOrVideo(media.fileType) === 'image' && (
            <ThreadImageCard
              image={media.fileUrl}
              aspectRatio={media.aspectRatio}
              originalDimensions={media.originalDimensions}
            />
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
        <div className='flex justify-between w-full space-x-2 xs:space-x-4 px-2 md:px-4'>
          <UserProfile author={author} />
          <div className='flex-between w-full'>
            <ul className='flex flex-wrap content-center items-center space-y-0.5 text-sm text-gray-3 sm:content-baseline sm:space-y-0 space-x-1 sm:space-x-2'>
              <Username author={author} />

              {variant === 'default' && (
                <>
                  <li>
                    <div className='hidden size-1 rounded-full bg-gray-3 sm:block'></div>
                  </li>

                  <li className='hidden hover:cursor-pointer hover:text-gray-2 mr-0 sm:block'>
                    <a href={`/@${author.username}`}>@{author.username}</a>
                  </li>
                  <li>
                    <div className='hidden size-1 rounded-full bg-gray-3 mr-0 sm:block'></div>
                  </li>
                </>
              )}
              <li className='mr-2 sm:mr-0'>
                <a href={`/post/${id}`}>{formatTimeAgo(createdAt)}</a>
              </li>
            </ul>

            <ThreadActionMenu
              authorId={author.id}
              postId={id}
              repostedBy={repostedBy}
            />
          </div>
        </div>
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
