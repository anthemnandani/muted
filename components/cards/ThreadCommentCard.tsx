'use client';

import {
  OptimisticActionProvider,
  TargetType,
} from '@/contexts/OptimisticActionContext';
import { QUERY_TYPE } from '@/lib/constants';
import { ThreadCommentCardProps } from '@/lib/types';
import { cn } from '@/lib/utils';
import useAddCommentStore from '@/store/addComment';
import { api } from '@/trpc/react';
import { ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Fragment, useMemo, useState } from 'react';
import ReplyInput from '../inputs/ReplyInput';
import ThreadCommentContent from '../shared/ThreadCommentContent';
import ThreadReplyCard from './ThreadReplyCard';
import { Icons } from '../icons';

const ThreadCommentCard = ({
  comment,
  isLast,
  originalThreadId,
  threadAuthorId,
}: ThreadCommentCardProps) => {
  const { id, repliesCount } = comment;
  const [showReplies, setShowReplies] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const { data, fetchNextPage, hasNextPage, isLoading } =
    api.thread.getReplies.useInfiniteQuery(
      {
        parentCommentId: id,
      },
      {
        enabled: showReplies,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    );

  const allReplies = data?.pages.flatMap((page) => page.replies) ?? [];

  const { isReply, cancelReply, replyToUsername, activeReplyCommentId } =
    useAddCommentStore();

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

  const repliesTarget = useMemo(
    () => ({
      type: QUERY_TYPE.THREAD_REPLIES,
      variables: { parentCommentId: id },
    }),
    [id],
  );

  return (
    <div className={cn('px-4 py-3', { 'mb-10': isLast })}>
      <ThreadCommentContent comment={comment} threadAuthorId={threadAuthorId} />

      {isActiveReplyInput && (
        <div className='mt-2 ml-12'>
          <ReplyInput
            threadId={originalThreadId}
            commentId={id}
            onCancel={handleCancelReply}
          />
        </div>
      )}

      {repliesCount > 0 && (
        <div className='ml-11 mt-2'>
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
        <div className='mt-2 ml-11'>
          {isLoading ? (
            <div className='flex justify-center py-4'>
              <Icons.loading className='size-8 animate-spin' />
            </div>
          ) : (
            allReplies.length > 0 && (
              <Fragment>
                <OptimisticActionProvider target={repliesTarget as TargetType}>
                  {allReplies.map((reply, index) => (
                    <ThreadReplyCard
                      key={reply.id}
                      reply={reply}
                      isLast={index === allReplies.length - 1}
                      originalThreadId={id}
                      threadAuthorId={threadAuthorId}
                    />
                  ))}
                </OptimisticActionProvider>
                {hasNextPage && (
                  <div className='mt-2'>
                    {isFetchingMore ? (
                      <div className='flex justify-center py-4'>
                        <Icons.loading className='size-6 animate-spin' />
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

export default ThreadCommentCard;
