'use client';
import { ThreadCardProps } from '@/lib/types';
import { cn, formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import ThreadActionMenu from '../menus/ThreadActionMenu';
import UserProfile from '../modals/UserProfile';
import Line from '../shared/Line';
import ThreadActions from '../shared/ThreadActions';
import { Separator } from '../ui/separator';
import RepostedBy from '../user/RepostedBy';
import Username from '../user/Username';
import ThreadQuoteCard from './ThreadQuoteCard';
import ThreadImageCard from './ThreadImageCard';

const ThreadCard: React.FC<ThreadCardProps> = ({
  id,
  text,
  createdAt,
  author,
  repostedBy,
  quoteId,
  images,
  repostedAt,
  likesCount,
  parentPost,
  likes,
  repostsCount,
  reposts,
  bookmarksCount,
  bookmarks,
  repliesCount,
  isLastThread,
  showUsername = false,
  isNested = false,
}) => {
  return (
    <article
      className={cn(
        'w-full',
        !isNested && 'pt-4',
        isLastThread && 'mb-20 md:mb-10'
      )}
    >
      <div className='px-4 md:px-6 mb-3'>
        {repostedBy && (
          <RepostedBy repostedBy={repostedBy} repostedAt={repostedAt} />
        )}

        <div className='flex justify-between'>
          <div className='flex gap-4 w-full'>
            <div className='flex flex-col items-center'>
              <UserProfile author={author} />
              {showUsername && <Line />}
            </div>
            <div className='flex flex-col w-full'>
              <div className='flex-between gap-5 py-px w-full max-md:max-w-full max-md:flex-wrap'>
                <div className='flex items-center gap-2'>
                  <Username author={author} />
                  <time className='text-[15px] leading-none text-gray-3'>
                    {formatTimeAgo(createdAt)}
                  </time>
                </div>
                <ThreadActionMenu
                  authorId={author.id}
                  postId={id}
                  repostedBy={repostedBy}
                />
              </div>
              {showUsername && parentPost?.author.username && (
                <div>
                  <Link
                    href={`/@${parentPost?.author.username}/post/${parentPost?.id}`}
                    className='text-gray-3 text-[15px] leading-5'
                  >
                    Replying to @{parentPost?.author.username}
                  </Link>
                </div>
              )}
              <Link href={`/@${author.username}/post/${id}`} className='w-full'>
                <div
                  dangerouslySetInnerHTML={{
                    __html: text.replace(/\\n/g, '\n'),
                  }}
                  className='text-accent-foreground text-[15px] leading-5 mt-[3px] max-md:max-w-full whitespace-pre-line'
                />
              </Link>
              {images && images.length > 0 && (
                <ThreadImageCard image={images[0]} />
              )}
              {quoteId && <ThreadQuoteCard quoteId={quoteId} />}

              <div className='-ml-2 flex-between max-w-[280px] md:max-w-[400px] pt-4'>
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
            </div>
          </div>
        </div>
      </div>

      {!isLastThread && !showUsername && <Separator />}
    </article>
  );
};

export default ThreadCard;
