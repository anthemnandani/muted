'use client';

import useGetReplies from '@/hooks/useGetReplies';
import useLike from '@/hooks/useLike';
import { CommentCardProps } from '@/lib/types';
import { cn, formatCount, formatTimeAgo } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import { ChevronDown, ChevronUp, Heart, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Fragment, useState } from 'react';
import CommentActions from '../comments/CommentActions';
import CommentText from '../comments/CommentText';
import ReplyInput from '../inputs/ReplyInput';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Username from '../user/Username';
import ReplyCard from './ReplyCard';

const CommentCard = ({
  comment,
  isLast,
  originalPostId,
  postAuthorId,
}: CommentCardProps) => {
  const {
    id,
    author,
    text,
    likesCount,
    createdAt,
    likes,
    mentions,
    repliesCount,
  } = comment;
  const [showReplies, setShowReplies] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const {
    startReplying,
    isReply,
    activeReplyCommentId,
    cancelReply,
    replyToUsername,
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

  const {
    allReplies,
    isLoading: isLoadingReplies,
    hasNextPage,
    fetchNextPage,
  } = useGetReplies({
    parentCommentId: id,
  });

  const handleReplyClick = () => {
    startReplying(id);
  };

  const handleCancelReply = () => {
    cancelReply();
  };

  const handleToggleReplies = () => {
    setShowReplies(!showReplies);
  };

  const handleFetchMoreReplies = async () => {
    setIsFetchingMore(true);
    await fetchNextPage();
    setIsFetchingMore(false);
  };

  const isActiveReplyInput =
    isReply && activeReplyCommentId === id && !replyToUsername;

  return (
    <div className={cn('px-4 py-3', { 'mb-10': isLast })}>
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
          <Username
            author={author}
            className='truncate text-base'
            postAuthorId={postAuthorId}
            isComment
          />
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
        />
      </div>

      {isActiveReplyInput && (
        <div className='mt-2 ml-12'>
          <ReplyInput
            postId={originalPostId || id}
            commentId={id}
            onCancel={handleCancelReply}
          />
        </div>
      )}

      {repliesCount > 0 && (
        <div className='ml-12 mt-2'>
          <button
            className='text-primary-blue text-sm hover:text-blue-400 flex items-center gap-1'
            onClick={handleToggleReplies}
          >
            {showReplies ? (
              <Fragment>
                <ChevronUp className='size-4' />
                Hide replies
              </Fragment>
            ) : (
              <Fragment>
                <ChevronDown className='size-4' />
                {repliesCount} {repliesCount === 1 ? 'reply' : 'replies'}
              </Fragment>
            )}
          </button>
        </div>
      )}

      {showReplies && (
        <div className='mt-2 ml-12'>
          {isLoadingReplies ? (
            <div className='flex justify-center py-4'>
              <Loader2 className='size-8 animate-spin' />
            </div>
          ) : (
            allReplies.length > 0 && (
              <Fragment>
                {allReplies.map((reply, index) => (
                  <ReplyCard
                    key={reply.id}
                    reply={reply}
                    isLast={index === allReplies.length - 1}
                    originalPostId={id}
                    postAuthorId={postAuthorId}
                  />
                ))}

                {hasNextPage && (
                  <div className='mt-2'>
                    {isFetchingMore ? (
                      <div className='flex justify-center py-4'>
                        <Loader2 className='size-6 animate-spin' />
                      </div>
                    ) : (
                      <button
                        onClick={handleFetchMoreReplies}
                        className='text-primary-blue text-sm hover:underline'
                      >
                        Show more replies
                      </button>
                    )}
                  </div>
                )}
              </Fragment>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default CommentCard;
