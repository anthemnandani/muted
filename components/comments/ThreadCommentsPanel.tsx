'use client';

import {
  OptimisticActionProvider,
  type TargetType,
} from '@/contexts/OptimisticActionContext';
import { QUERY_TYPE } from '@/lib/constants';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInView } from 'react-intersection-observer';
import { Icons } from '../icons';
import CommentCardSkeleton from '../skeletons/CommentCardSkeleton';
import CommentsPanelHeader from './CommentsPanelHeader';
import AddThreadComment from './AddThreadComment';
import ThreadCommentCard from '../cards/ThreadCommentCard';
import { api } from '@/trpc/react';
import PostInfoCard from '../cards/PostInfoCard';
import LinkShare from './LinkShare';
import useSortByComments from '@/store/sortByComments';
import { ThreadCommentsPanelProps } from '@/lib/types';

const ThreadCommentsPanel: React.FC<ThreadCommentsPanelProps> = ({
  threadId,
  onClose,
  authorId,
  repliesCount,
  text,
  createdAt,
  author,
  repostedBy,
  reposts,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerControls = useAnimation();
  const { sortBy } = useSortByComments();

  const [infoCardSentinelRef, isInfoCardVisible] = useInView({
    threshold: 0.1,
    initialInView: true,
  });

  const { data, fetchNextPage, hasNextPage, isLoading } =
    api.thread.getComments.useInfiniteQuery(
      {
        id: threadId,
        sortBy,
      },
      {
        getNextPageParam: (lastPage) => lastPage.nextCursor,
      }
    );

  const allComments = data?.pages.flatMap((p) => p.comments) || [];

  useEffect(() => {
    if (isInfoCardVisible) {
      headerControls.start({
        boxShadow: 'none',
        backgroundColor: 'transparent',
      });
    } else {
      headerControls.start({
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        backgroundColor: '#101010',
      });
    }
  }, [isInfoCardVisible, headerControls]);

  const renderSkeletons = () =>
    Array(7)
      .fill(0)
      .map((_, i) => <CommentCardSkeleton key={i} />);

  const commentsTarget = useMemo(
    () => ({
      type: QUERY_TYPE.THREAD_COMMENTS,
      variables: { id: threadId, sortBy },
    }),
    [threadId, sortBy]
  );

  return (
    <div className='h-full flex flex-col bg-[#101010D9] border border-border-light'>
      {/* SCROLL AREA */}
      <div
        ref={scrollRef}
        id='scrollableDiv'
        className='flex-1 overflow-y-auto hide-scrollbar flex flex-col'
      >
        {/* ✅ SAME AS POST PANEL */}
        {(author && createdAt) && (
          <div ref={infoCardSentinelRef} className='p-4'>
            <PostInfoCard
              postText={text || ''}
              author={author}
              createdAt={createdAt}
              reposts={reposts}
              repostedBy={repostedBy}
            />

            <LinkShare
              url={`${process.env.NEXT_PUBLIC_APP_URL}/thread/${threadId}`}
            />
          </div>
        )}

        {/* Sticky Header */}
        <motion.div
          className='sticky top-0 z-10 transition-all'
          animate={headerControls}
          initial={{ boxShadow: 'none', backgroundColor: 'transparent' }}
          transition={{
            duration: 0.7,
            ease: 'easeInOut',
          }}
        >
          <CommentsPanelHeader
            repliesCount={repliesCount}
            onClose={onClose}
          />
        </motion.div>

        {/* Comments */}
        <div className='flex-1'>
          {isLoading ? (
            <div className='w-full'>{renderSkeletons()}</div>
          ) : (
            <OptimisticActionProvider target={commentsTarget as TargetType}>
              <InfiniteScroll
                dataLength={allComments.length}
                next={fetchNextPage}
                hasMore={!!hasNextPage}
                loader={
                  <div className='w-full flex-center py-4'>
                    <Icons.loading className='size-8' />
                  </div>
                }
                scrollableTarget='scrollableDiv'
              >
                {allComments.length === 0 ? (
                  <p className='text-center text-gray-400 py-8'>
                    No comments yet
                  </p>
                ) : (
                  allComments.map((comment, index) => (
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
                        repliesCount: comment.repliesCount || 0,
                        reposts: comment.reposts,
                        repostsCount: comment.repostsCount || 0,
                      }}
                      threadAuthorId={authorId}
                      isLast={index === allComments.length - 1}
                      originalThreadId={threadId}
                    />
                  ))
                )}
              </InfiniteScroll>
            </OptimisticActionProvider>
          )}
        </div>
      </div>

      {/* Add Comment */}
      <div className='mt-auto'>
        <AddThreadComment threadId={threadId} authorId={authorId} />
      </div>
    </div>
  );
};

export default ThreadCommentsPanel;