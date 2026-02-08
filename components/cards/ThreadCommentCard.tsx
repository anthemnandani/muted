'use client';

import useLike from '@/hooks/useLike';
import { useThreadRepost } from '@/hooks/useThreadRepost';
import { ThreadCommentCardProps } from '@/lib/types';
import { cn, formatCount, formatTimeAgo } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import { Heart, Repeat2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import CommentActions from '../comments/CommentActions';
import CommentText from '../comments/CommentText';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import Username from '../user/Username';

const ThreadCommentCard = ({
  comment,
  isLast,
  originalThreadId,
  threadAuthorId,
}: ThreadCommentCardProps) => {
  const {
    id,
    author,
    text,
    likesCount,
    createdAt,
    likes,
    mentions,
    reposts,
    repliesCount,
    repostsCount,
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
    toggleLike,
  } = useLike({
    initialLikesCount: likesCount,
    likes,
    id,
    type: 'THREAD',
  });

  const {
    isRepostedByMe,
    repostsCount: mainRepostsCount,
    toggleRepost,
  } = useThreadRepost({
    reposts,
    initialRepostsCount: repostsCount!,
    threadId: id,
  });

  //   const {
  //     allReplies,
  //     isLoading: isLoadingReplies,
  //     hasNextPage,
  //     fetchNextPage,
  //   } = useGetReplies({
  //     parentCommentId: id,
  //   });

  const handleReplyClick = () => {
    startReplying(id);
  };

  //   const handleCancelReply = () => {
  //     cancelReply();
  //   };

  //   const handleToggleReplies = () => {
  //     setShowReplies(!showReplies);
  //   };

  //   const handleFetchMoreReplies = async () => {
  //     setIsFetchingMore(true);
  //     await fetchNextPage();
  //     setIsFetchingMore(false);
  //   };

  //   const isActiveReplyInput =
  //     isReply && activeReplyCommentId === id && !replyToUsername;

  //   const repliesTarget = useMemo(
  //     () => ({
  //       type: QUERY_TYPE.REPLIES,
  //       variables: { parentCommentId: id },
  //     }),
  //     [id],
  //   );

  return (
    <div className={cn('px-4 py-3', { 'mb-10': isLast })}>
      <div className='flex items-start gap-3 group relative'>
        <Link href={`/@${author.username}`} className='flex-shrink-0 pt-1'>
          <Avatar className='rounded-full size-8'>
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
          <div className='flex items-center gap-2 mb-0.5'>
            <Username
              author={author}
              className='truncate text-[14px] font-semibold leading-none'
              postAuthorId={threadAuthorId}
              isComment
            />
            <span className='text-white/50 inline-block align-middle'>
              &middot;
            </span>
            <span className='text-[12px] text-white/50 leading-none'>
              {formatTimeAgo(createdAt)}
            </span>
          </div>

          <CommentText text={text!} mentions={mentions} />

          <div className='flex items-center mt-2.5 gap-6'>
            <button
              onClick={toggleLike}
              className='flex items-center gap-1.5 group/like'
            >
              <Heart
                fill={isLikedByMe ? '#ff3040' : 'transparent'}
                className={cn(
                  'size-[15px] text-gray-400 transition-colors group-hover/like:text-primary-red',
                  {
                    'text-primary-red': isLikedByMe,
                  },
                )}
              />
              {updatedLikesCount > 0 && (
                <span
                  className={cn(
                    'text-[12px] text-gray-400 group-hover/like:text-primary-red',
                    isLikedByMe && 'text-primary-red',
                  )}
                >
                  {formatCount(updatedLikesCount)}
                </span>
              )}
            </button>

            <button
              className='flex items-center gap-1.5 group/repost'
              onClick={toggleRepost}
            >
              <Repeat2
                className={cn(
                  'size-[15px] text-gray-400 transition-colors group-hover/repost:text-primary-blue',
                  {
                    'text-primary-blue': isRepostedByMe,
                  },
                )}
              />
              {mainRepostsCount > 0 && (
                <span
                  className={cn(
                    'text-[12px] text-gray-400 group-hover/repost:text-primary-blue',
                    isRepostedByMe && 'text-primary-blue',
                  )}
                >
                  {formatCount(mainRepostsCount)}
                </span>
              )}
            </button>

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
          postAuthorId={threadAuthorId}
          postId={id}
          createdAt={createdAt}
          text={text ?? ''}
        />
      </div>

      {/* {repliesCount > 0 && (
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
      )} */}

      {/* {showReplies && (
        <div className='mt-2 ml-12'>
          {isLoadingReplies ? (
            <div className='flex justify-center py-4'>
              <Loader2 className='size-8 animate-spin' />
            </div>
          ) : (
            allReplies.length > 0 && (
              <Fragment>
                <OptimisticActionProvider target={repliesTarget as TargetType}>
                  {allReplies.map((reply, index) => (
                    <ReplyCard
                      key={reply.id}
                      reply={reply}
                      isLast={index === allReplies.length - 1}
                      originalPostId={id}
                      postAuthorId={postAuthorId}
                    />
                  ))}
                </OptimisticActionProvider>
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
      )} */}
    </div>
  );
};

export default ThreadCommentCard;
