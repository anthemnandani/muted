import type { PostReplyCardProps } from '@/lib/types';
import { cn, formatTimeAgo } from '@/lib/utils';
import React from 'react';
import ThreadCard from './ThreadCard';
import { Dialog, DialogContent, DialogTrigger } from '../ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Plus } from 'lucide-react';
import UserProfileCard from './UserProfileCard';
import Username from '../user/Username';
import ThreadActionMenu from '../menus/ThreadActionMenu';
import { Icons } from '../icons';
import { Separator } from '../ui/separator';

const ThreadReplyCard: React.FC<PostReplyCardProps> = ({
  postInfo,
  parentPosts,
}) => {
  const {
    id,
    likes,
    replies,
    author,
    count,
    createdAt,
    text,
    images,
    reposts,
    quoteId,
  } = postInfo;
  return (
    <>
      <div
        className={cn('flex flex-col w-full pt-2 mb-5', {
          'mb-0': replies.length > 0,
        })}
      >
        {parentPosts?.map((post, index) => (
          <>
            <ThreadCard
              key={index}
              author={post.author}
              count={post.count}
              id={post.id}
              createdAt={post.createdAt}
              likes={post.likes}
              parentPostId={post.parentPostId}
              replies={post.replies}
              images={post.images}
              text={post.text}
              quoteId={post.quoteId}
              reposts={post.reposts}
            />
          </>
        ))}
      </div>

      <article className='w-full'>
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
            </div>
            <div className='flex flex-col w-full'>
              <div className='flex-between gap-5 py-px w-full max-md:max-w-full max-md:flex-wrap'>
                <div className='flex items-center gap-2'>
                  <Username author={author} />
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
        <Separator />
      </article>
    </>
  );
};

export default ThreadReplyCard;
