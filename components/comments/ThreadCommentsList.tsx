'use client';

import { Icons } from '@/components/icons';
import {
  OptimisticActionProvider,
  TargetType,
} from '@/contexts/OptimisticActionContext';
import { QUERY_TYPE } from '@/lib/constants';
import useSortByComments from '@/store/sortByComments';
import { api } from '@/trpc/react';
import { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ThreadCommentCard from '../cards/ThreadCommentCard';

const ThreadCommentsList = ({
  threadId,
  threadAuthorId,
}: {
  threadId: string;
  threadAuthorId: string;
}) => {
  const { sortBy } = useSortByComments();
  const { data, fetchNextPage, hasNextPage, isLoading, isError } =
    api.thread.getComments.useInfiniteQuery(
      {
        id: threadId,
        sortBy,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        trpc: { abortOnUnmount: true },
        staleTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    );

  const commentsTarget = useMemo(
    () => ({
      type: QUERY_TYPE.THREAD_COMMENTS,
      variables: { id: threadId, sortBy },
    }),
    [threadId, sortBy],
  );

  if (isLoading) {
    return (
      <div className='flex justify-center h-[300px]'>
        <Icons.loading className='size-10 animate-spin' />
      </div>
    );
  }

  if (isError) {
    return (
      <div className='text-center text-primary-red py-8 text-sm'>
        Failed to load comments.
      </div>
    );
  }

  const allComments = data?.pages.flatMap((page) => page.comments) || [];

  if (allComments.length === 0) {
    return (
      <div className='text-center text-white/70 py-10 text-sm'>
        No comments yet.
      </div>
    );
  }

  return (
    <div className='flex-1 mb-4'>
      <OptimisticActionProvider target={commentsTarget as TargetType}>
        <InfiniteScroll
          dataLength={allComments.length}
          next={fetchNextPage}
          hasMore={!!hasNextPage}
          loader={
            <div className='h-10 w-full flex-center'>
              <Icons.loading className='size-6' />
            </div>
          }
        >
          {allComments.map((comment, index) => (
            <ThreadCommentCard
              key={comment.id}
              comment={{
                id: comment.id,
                text: comment.text,
                author: comment.author,
                createdAt: comment.createdAt,
                likesCount: comment.likesCount,
                likes: comment.likes,
                mentions: comment.mentions,
                reposts: comment.reposts,
                repliesCount: comment.repliesCount || 0,
                repostsCount: comment.repostsCount || 0,
              }}
              threadAuthorId={threadAuthorId}
              isLast={index === allComments.length - 1}
              originalThreadId={threadId}
            />
          ))}
        </InfiniteScroll>
      </OptimisticActionProvider>
    </div>
  );
};

export default ThreadCommentsList;
