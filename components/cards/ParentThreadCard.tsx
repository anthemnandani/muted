'use client';

import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import BookmarkButton from '../buttons/BookmarkButton';
import CopyLinkButton from '../buttons/CopyLinkButton';
import LikeButton from '../buttons/LikeButton';
import ReplyButton from '../buttons/ReplyButton';
import RepostButton from '../buttons/RepostButton';
import ThreadActionMenu from '../menus/ThreadActionMenu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Separator } from '../ui/separator';
import Username from '../user/Username';
import ThreadQuoteCard from './ThreadQuoteCard';
import UserProfileCard from './UserProfileCard';
import { ParentThreadCardProps } from '@/lib/types';

const ParentThreadCard: React.FC<ParentThreadCardProps> = ({ postInfo }) => {
  const {
    id,
    author,
    createdAt,
    text,
    likes,
    likesCount,
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
    <>
      <div className={cn('flex flex-col w-full pt-2')}>
        <article className='w-full pt-4'>
          <div className='flex flex-col px-4 md:px-6 mb-4'>
            <div className='flex justify-between'>
              <div className='flex gap-4 w-full'>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className='relative' type='button'>
                      <div className='size-9 outline outline-1 outline-border rounded-full ml-[1px]'>
                        <Avatar className='rounded-full w-full h-full '>
                          <AvatarImage
                            src={author?.image ?? ''}
                            alt={author?.username}
                            className='object-cover'
                          />
                          <AvatarFallback>
                            {author?.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className='bg-foreground absolute -bottom-0.5 -right-0.5 rounded-2xl border-2 border-background text-background hover:scale-105 active:scale-95'>
                        <Plus className='size-4 p-0.5 text-white dark:text-black' />
                      </div>
                    </button>
                  </DialogTrigger>
                  <DialogContent className='!max-w-[360px] w-full p-0 rounded-2xl border-none'>
                    <UserProfileCard {...author} />
                  </DialogContent>
                </Dialog>

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
                <div
                  dangerouslySetInnerHTML={{
                    __html: text.replace(/\\n/g, '\n'),
                  }}
                  className='text-accent-foreground text-[15px] leading-5 mt-1 max-md:max-w-full whitespace-pre-line'
                />
              </Link>
              {quoteId && <ThreadQuoteCard quoteId={quoteId} />}
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

              <div className='flex items-center justify-around border-b border-zinc-800 py-3'>
                <LikeButton
                  likeInfo={{
                    id,
                    likesCount: likesCount || 0,
                    likes,
                  }}
                  isParentPost
                />

                <ReplyButton
                  replyThreadInfo={{
                    id,
                    text,
                    images: [],
                    author: { ...author },
                    createdAt,
                  }}
                  repliesCount={repliesCount}
                  isParentPost
                />
                <RepostButton
                  id={id}
                  text={text}
                  author={author}
                  createdAt={createdAt}
                  reposts={reposts}
                  repostsCount={repostsCount || 0}
                  isParentPost
                />
                <BookmarkButton
                  bookmarkInfo={{
                    id,
                    bookmarksCount: bookmarksCount || 0,
                    bookmarks,
                  }}
                  isParentPost
                />
                <CopyLinkButton postId={id} username={author.username} />
              </div>
              {repliesCount > 0 && (
                <div className='mt-6 mb-2 font-semibold text-[15px] leading-none'>
                  Replies
                </div>
              )}
            </div>
          </div>
          {repliesCount > 0 && <Separator />}
        </article>
      </div>
    </>
  );
};

export default ParentThreadCard;
