import { PostProps } from '@/lib/types';
import { formatTimeAgo } from '@/lib/utils';
import Link from 'next/link';
import React from 'react';
import { Icons } from '../icons';
import ThreadActionMenu from '../menus/ThreadActionMenu';
import { Separator } from '../ui/separator';
import UserProfileCard from './UserProfileCard';

const ThreadCard: React.FC<PostProps> = ({
  text,
  createdAt,
  author,
  isLastThread,
}) => {
  return (
    <article className='w-full cursor-pointer pt-4'>
      <div className='flex justify-between px-2 md:px-4 mb-4'>
        <div className='flex gap-4 w-full'>
          <div className='flex-col-center'>
            <UserProfileCard {...author} />
          </div>
          <div className='flex flex-col w-full'>
            <div className='flex-between gap-5 py-px w-full max-md:max-w-full max-md:flex-wrap'>
              <div className='flex items-center gap-2'>
                <Link href={`/@${author.username}`} className='w-fit'>
                  <h4 className='font-semibold text-[15px] leading-none'>
                    {author.username}
                  </h4>
                </Link>
                <time className='text-[15px] leading-none text-gray-3'>
                  {formatTimeAgo(createdAt)}
                </time>
              </div>
              <ThreadActionMenu />
            </div>
            <p className='text-accent-foreground text-[15px] leading-5 mt-1 max-md:max-w-full whitespace-pre-line'>
              {text}
            </p>
            <div className='flex flex-col gap-3 mt-2'>
              <div className='flex items-center gap-3.5 -ml-2'>
                <div className='flex-center hover:bg-primary p-2 rounded-full w-fit h-fit active:scale-95'>
                  <Icons.heart className='h-[18px] w-[18px] transition-colors duration-150 text-gray-4 dark:text-gray-2' />
                </div>

                <div className='flex-center hover:bg-primary p-2 rounded-full w-fit h-fit active:scale-95'>
                  <Icons.reply className='h-[18px] w-[18px] transition-colors duration-150 text-gray-4 dark:text-gray-2' />
                </div>
                <div className='flex-center hover:bg-primary p-2 rounded-full w-fit h-fit active:scale-95'>
                  <Icons.repost className='h-[18px] w-[18px] transition-colors duration-150 text-gray-4 dark:text-gray-2' />
                </div>
                <div className='flex-center hover:bg-primary p-2 rounded-full w-fit h-fit active:scale-95'>
                  <Icons.share className='h-[18px] w-[18px] transition-colors duration-150 text-gray-4 dark:text-gray-2' />
                </div>
              </div>
              {/* {isComment && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className='text-[12px] font-weight-500 text-gray-1'>
                    {comments.length} repl{comments.length > 1 ? 'ies' : 'y'}
                  </p>
                </Link>
              )} */}
            </div>
          </div>
        </div>
        {/* <DeleteThread
          currentUserId={currentUserId}
          authorId={author.id}
          threadId={JSON.stringify(id)}
          parentId={parentId}
          isComment={isComment}
        /> */}
      </div>

      {/* {!isComment && comments.length > 0 && (
        <div className='ml-1 mt-3 flex items-center gap-2'>
          {comments.slice(0, 2).map((comment, index) => (
            <div className='relative w-6 h-6'>
              <Image
                key={index}
                src={comment.author.image}
                alt={`user_${index}`}
                fill
                className={`${index !== 0 && '-ml-5'} rounded-full`}
              />
            </div>
          ))}

          <Link href={`/thread/${id}`}>
            <p
              className={`mt-1 text-subtle-medium text-gray-1 ${
                comments.length > 1 && '-ml-4'
              }`}
            >
              {comments.length} repl{comments.length > 1 ? 'ies' : 'y'}
            </p>
          </Link>
        </div>
      )} */}
      {/* {!isComment && community && (
        <Link
          href={`/communities/${community.id}`}
          className='mt-5 flex items-center'
        >
          <p className='text-gray-1 text-[12px] font-medium'>
            {formatDateString(createdAt.toString())} - {community.name}{' '}
            Community
          </p>
          <div className='relative w-4 h-4'>
            <Image
              src={community.image}
              alt={community.name}
              fill
              className='rounded-full ml-1'
            />
          </div>{' '}
        </Link>
      )} */}
      {!isLastThread && <Separator />}
    </article>
  );
};

export default ThreadCard;
