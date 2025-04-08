'use client';

import useLike from '@/hooks/useLike';
import { Comment } from '@/lib/types';
import { cn, formatCount, formatTimeAgo } from '@/lib/utils';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Username from '../user/Username';
import CommentActions from './CommentActions';

const CommentCard = ({ comment }: { comment: Comment }) => {
  const { id, author, text, likesCount, createdAt, likes } = comment;
  const {
    isLikedByMe,
    likesCount: updatedLikesCount,
    isLoading,
    toggleLike,
  } = useLike({
    initialLikesCount: likesCount,
    likes,
  });
  return (
    <div className='px-4 py-3'>
      <div className='flex items-start gap-3'>
        <Link href={`/@${author.username}`} className='flex-shrink-0'>
          <Avatar className='rounded-full w-full h-full size-10'>
            <AvatarImage
              src={author.image ?? ''}
              alt={author.username ?? ''}
              className='object-cover'
            />
            <AvatarFallback>
              {author.username?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        <div className='flex-1 min-w-0'>
          <Username author={author} className='truncate text-base' />
          <p className='text-[0.9rem] leading-[1.1375rem] mt-1 text-white/90 break-words whitespace-pre-line antialiased'>
            {text}
          </p>
          <div className='flex items-center mt-1 gap-6'>
            <span className='text-sm text-gray-400'>
              {formatTimeAgo(createdAt)}
            </span>
            <div className='flex items-center'>
              <button
                className=' text-gray-400 hover:text-gray-300'
                type='button'
                disabled={isLoading}
                title={isLikedByMe ? 'Unlike' : 'Like'}
                onClick={() => toggleLike({ id })}
              >
                <Heart
                  fill={isLikedByMe ? '#ff3040' : ''}
                  className={cn('size-4', {
                    'text-primary-red': isLikedByMe,
                  })}
                />
              </button>
              <span className='ml-1 text-sm'>
                {formatCount(updatedLikesCount)}
              </span>
            </div>

            <button className='text-gray-400 text-sm hover:text-gray-300'>
              Reply
            </button>
          </div>
        </div>
        <CommentActions
          authorId={author.id}
          postId={id}
          createdAt={createdAt}
          text={text ?? ''}
        />
      </div>
    </div>
  );
};

export default CommentCard;
