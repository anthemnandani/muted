'use client';

import useLike from '@/hooks/useLike';
import type { Comment } from '@/lib/types';
import { cn, formatCount, formatTimeAgo } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import CommentActions from '../comments/CommentActions';
import CommentText from '../comments/CommentText';
import ReplyInput from '../inputs/ReplyInput';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Username from '../user/Username';
import { ReplyCardProps } from '@/lib/types';

const ReplyCard = ({ reply, isLast, originalPostId }: ReplyCardProps) => {
  const { id, author, text, likesCount, createdAt, likes, mentions } = reply;

  const {
    startReplying,
    isReply,
    activeReplyCommentId,
    isReplyEdit,
    cancelReply,
    startReplyEditing,
    resetReply,
  } = useAddCommentStore();

  const {
    isLikedByMe,
    likesCount: updatedLikesCount,
    isLoading,
    toggleLike,
  } = useLike({
    initialLikesCount: likesCount,
    likes,
  });

  const handleReplyClick = () => {
    startReplying(id);
  };

  const handleCancelReply = () => {
    cancelReply();
  };

  const handleEditClick = () => {
    startReplyEditing(id, text || '');
  };

  const handleCancelEdit = () => {
    resetReply();
  };

  const isActiveReplyInput = isReply && activeReplyCommentId === id;

  return (
    <div className={cn('py-3', { 'mb-1': isLast })}>
      <div className='flex items-start gap-3'>
        <Link href={`/@${author.username}`} className='flex-shrink-0'>
          <Avatar className='rounded-full w-full h-full size-8'>
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
          <CommentText text={text!} mentions={mentions} />
          <div className='flex items-center mt-1 gap-6'>
            <span className='text-sm text-gray-400'>
              {formatTimeAgo(createdAt)}
            </span>
            <div className='flex items-center'>
              <button
                className='text-gray-400 hover:text-gray-300'
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

            <button
              className='text-gray-100 text-sm hover:text-gray-200'
              onClick={handleReplyClick}
            >
              Reply
            </button>
          </div>
        </div>
        <CommentActions
          authorId={author.id}
          postId={id}
          createdAt={createdAt}
          text={text ?? ''}
          isReply
          onEditClick={handleEditClick}
        />
      </div>

      {isActiveReplyInput && (
        <div className='mt-2 ml-10'>
          <ReplyInput
            postId={originalPostId}
            commentId={id}
            onCancel={handleCancelReply}
          />
        </div>
      )}

      {isReplyEdit && (
        <div className='mt-2 ml-10'>
          <ReplyInput
            postId={originalPostId}
            commentId={id}
            onCancel={handleCancelEdit}
          />
        </div>
      )}
    </div>
  );
};

export default ReplyCard;
