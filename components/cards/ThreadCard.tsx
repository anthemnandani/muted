'use client';
import { ParentPostProps } from '@/lib/types';
import { cn, formatTimeAgo } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import BookmarkButton from '../buttons/BookmarkButton';
import LikeButton from '../buttons/LikeButton';
import ReplyButton from '../buttons/ReplyButton';
import RepostButton from '../buttons/RepostButton';
import { Icons } from '../icons';
import ThreadActionMenu from '../menus/ThreadActionMenu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Separator } from '../ui/separator';
import RepostedBy from '../user/RepostedBy';
import Username from '../user/Username';
import ThreadQuoteCard from './ThreadQuoteCard';
import UserProfileCard from './UserProfileCard';

const ThreadCard: React.FC<ParentPostProps> = ({
  id,
  text,
  createdAt,
  author,
  likesCount,
  repostsCount,
  likes,
  reposts,
  bookmarksCount,
  bookmarks,
  repliesCount,
  repostedBy,
  quoteId,
  repostedAt,
  isLastThread,
  showSeparator = true,
  showLine = false,
  isNested = false,
  isReply = false,
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

              {showLine && (
                <div className='mt-4 w-0.5 bg-[#D8D8D8] dark:bg-[#313639] rounded-full grow relative'></div>
              )}
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
              <Link href={`/@${author.username}/post/${id}`} className='w-full'>
                <div
                  dangerouslySetInnerHTML={{
                    __html: text.replace(/\\n/g, '\n'),
                  }}
                  className='text-accent-foreground text-[15px] leading-5 mt-1 max-md:max-w-full whitespace-pre-line'
                />
              </Link>
              {quoteId && <ThreadQuoteCard quoteId={quoteId} />}
              <div className='flex flex-col gap-3 pt-4'>
                <div
                  className={cn(
                    '-ml-2',
                    isReply && 'flex items-center gap-3.5',
                    !isReply && 'flex-between max-w-[280px] md:max-w-[400px]'
                  )}
                >
                  <LikeButton
                    likeInfo={{
                      id,
                      likesCount: likesCount || 0,
                      likes,
                    }}
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
                  />
                  <RepostButton
                    id={id}
                    text={text}
                    author={author}
                    createdAt={createdAt}
                    reposts={reposts}
                    repostsCount={repostsCount || 0}
                  />
                  <BookmarkButton
                    bookmarkInfo={{
                      id,
                      bookmarksCount: bookmarksCount || 0,
                      bookmarks,
                    }}
                  />
                  <div className='flex-center hover:bg-primary p-2 rounded-full w-fit h-fit active:scale-95 cursor-pointer'>
                    <Icons.copyLink2 className='size-5 transition-colors duration-150' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {!isLastThread && showSeparator && !showLine && <Separator />}
    </article>
  );
};

export default ThreadCard;
