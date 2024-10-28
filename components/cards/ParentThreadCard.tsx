'use client';

import { ParentThreadCardProps } from '@/lib/types';
import { format } from 'date-fns';
import Link from 'next/link';
import React from 'react';
import ThreadActionMenu from '../menus/ThreadActionMenu';
import UserProfile from '../modals/UserProfile';
import ThreadActions from '../shared/ThreadActions';
import Username from '../user/Username';
import ThreadImageCard from './ThreadImageCard';
import ThreadQuoteCard from './ThreadQuoteCard';
import { isImageOrVideo } from '@/lib/utils';
import ThreadVideoCard from './ThreadVideoCard';

const ParentThreadCard: React.FC<ParentThreadCardProps> = ({ postInfo }) => {
  const {
    id,
    author,
    createdAt,
    text,
    likes,
    likesCount,
    media,
    bookmarks,
    bookmarksCount,
    repliesCount,
    repostsCount,
    reposts,
    quoteId,
  } = postInfo;
  const time = format(createdAt, 'h:mm a');
  const date = format(createdAt, 'MMM d, yyyy');
  return (
    <div className='flex flex-col w-full pt-2'>
      <article className='pt-4'>
        <div className='flex flex-col px-4 md:px-6 mb-4'>
          <div className='flex justify-between'>
            <div className='flex gap-4 w-full'>
              <UserProfile author={author} />
              <div className='flex-between gap-5 py-px w-full max-md:max-w-full max-md:flex-wrap'>
                <Username author={author} />
                <ThreadActionMenu
                  authorId={author.id}
                  postId={id}
                  repostedBy={author}
                />
              </div>
            </div>
          </div>
          <div className='flex flex-col pt-2.5'>
            <Link href={`/@${author.username}/post/${id}`} className='w-full'>
              {text && (
                <div
                  dangerouslySetInnerHTML={{
                    __html: text.replace(/\\n/g, '\n'),
                  }}
                  className='text-accent-foreground text-[15px] leading-5 mt-1 max-md:max-w-full whitespace-pre-line'
                />
              )}
              {quoteId && <ThreadQuoteCard quoteId={quoteId} />}
              {media && media.fileType && (
                <>
                  {isImageOrVideo(media.fileType) === 'image' && (
                    <ThreadImageCard image={media.fileUrl} />
                  )}
                  {isImageOrVideo(media.fileType) === 'video' && (
                    <ThreadVideoCard
                      video={media.fileUrl}
                      aspectRatio={media.aspectRatio}
                    />
                  )}
                </>
              )}
            </Link>
            <div className='mt-1 flex items-center space-x-2 py-2 text-[15px] text-gray-3'>
              <p>{time}</p>
              <div className='size-1 rounded-full bg-gray-3'></div>
              <p>{date}</p>
            </div>
            <div className='flex items-center space-x-6 border-t border-b border-zinc-800 py-3'>
              <div>
                <span className='font-medium'>{repliesCount}</span>{' '}
                <span className='text-gray-3'>
                  comment{repliesCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div>
                <span className='font-medium'>{repostsCount}</span>{' '}
                <span className='text-gray-3'>
                  repost{repostsCount !== 1 ? 's' : ''}
                </span>
              </div>
              <div>
                <span className='font-medium'>{likesCount}</span>{' '}
                <span className='text-gray-3'>
                  like{likesCount !== 1 ? 's' : ''}
                </span>
              </div>
            </div>

            <div className='flex-around border-b border-zinc-800 py-3'>
              <ThreadActions
                id={id}
                likesCount={likesCount}
                likes={likes}
                text={text || ''}
                author={author}
                createdAt={createdAt}
                repliesCount={repliesCount}
                reposts={reposts}
                repostsCount={repostsCount}
                bookmarks={bookmarks}
                bookmarksCount={bookmarksCount}
                isParentPost
              />
            </div>
            {repliesCount > 0 && (
              <div className='mt-6 mb-2 font-semibold text-[15px] leading-none'>
                Replies
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  );
};

export default ParentThreadCard;
