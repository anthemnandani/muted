'use client';
import { ParentPostProps } from '@/lib/types';
import { cn, formatTimeAgo } from '@/lib/utils';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import LikeButton from '../buttons/LikeButton';
import ReplyButton from '../buttons/ReplyButton';
import { Icons } from '../icons';
import ThreadActionMenu from '../menus/ThreadActionMenu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Separator } from '../ui/separator';
import Username from '../user/Username';
import UserProfileCard from './UserProfileCard';

const ThreadCard: React.FC<ParentPostProps> = ({
  id,
  text,
  createdAt,
  author,
  likesCount,
  likes,
  isLastThread,
  repliesCount,
  showSeparator = true,
  showLine = false,
  isNested = false,
}) => {
  return (
    <article className={cn('w-full', !isNested && 'pt-4')}>
      <div className='flex justify-between px-4 md:px-6 mb-4'>
        <div className='flex gap-4 w-full'>
          <div className='flex-col-center'>
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
              <ThreadActionMenu authorId={author.id} />
            </div>
            <Link href={`/@${author.username}/post/${id}`} className='w-full'>
              <div
                dangerouslySetInnerHTML={{
                  __html: text.replace(/\\n/g, '\n'),
                }}
                className='text-accent-foreground text-[15px] leading-5 mt-1 max-md:max-w-full whitespace-pre-line'
              />
            </Link>
            <div className='flex flex-col gap-3 pt-2.5'>
              <div className='flex items-center gap-3.5 -ml-2'>
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
                <div className='flex-center hover:bg-primary p-2 rounded-full w-fit h-fit active:scale-95'>
                  <Icons.repost className='h-[18px] w-[18px] transition-colors duration-150 text-gray-4 dark:text-gray-2' />
                </div>
                <div className='flex-center hover:bg-primary p-2 rounded-full w-fit h-fit active:scale-95'>
                  <Icons.share className='h-[18px] w-[18px] transition-colors duration-150 text-gray-4 dark:text-gray-2' />
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
