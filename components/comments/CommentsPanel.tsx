'use client';

import useGetComments from '@/hooks/useGetComments';
import { CommentsProps } from '@/lib/types';
import useAddCommentStore from '@/store/addComment';
import useCommentPanelStore from '@/store/commentPanel';
import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInView } from 'react-intersection-observer';
import PostInfoCard from '../cards/PostInfoCard';
import { Icons } from '../icons';
import CommentCardSkeleton from '../skeletons/CommentCardSkeleton';
import AddComment from './AddComment';
import CommentCard from '../cards/CommentCard';
import CommentsPanelHeader from './CommentsPanelHeader';
import LinkShare from './LinkShare';
import useSortByComments from '@/store/sortByComments';

const CommentsPanel: React.FC<CommentsProps> = ({
  postId,
  onClose,
  authorId,
  isOpen,
  repliesCount,
  text,
  createdAt,
  author,
  reposts,
  repostedBy,
}) => {
  const [isSwitchingPost, setIsSwitchingPost] = useState(false);
  const prevPostIdRef = useRef(postId);
  const { reset } = useAddCommentStore();
  const { setScrollPosition, getScrollPosition } = useCommentPanelStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const headerControls = useAnimation();
  const { sortBy } = useSortByComments();

  const [infoCardSentinelRef, isInfoCardVisible] = useInView({
    threshold: 0.1,
    initialInView: true,
  });

  const { allComments, isLoading, hasNextPage, fetchNextPage } = useGetComments(
    {
      postId,
      sortBy,
    }
  );

  useEffect(() => {
    if (isInfoCardVisible) {
      headerControls.start({
        boxShadow: 'none',
        backgroundColor: 'transparent',
      });
    } else {
      headerControls.start({
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
        backgroundColor: '#101010',
      });
    }
  }, [isInfoCardVisible, headerControls]);

  useEffect(() => {
    if (prevPostIdRef.current !== postId) {
      setIsSwitchingPost(true);
      prevPostIdRef.current = postId;
      if (scrollRef.current) scrollRef.current.scrollTop = 0;
    }
  }, [postId]);

  useEffect(() => {
    if (!isLoading && isSwitchingPost) {
      setIsSwitchingPost(false);
    }
  }, [isLoading, isSwitchingPost]);

  useEffect(() => {
    if (!isOpen) reset();
  }, [isOpen, reset]);

  useEffect(() => {
    return () => {
      if (scrollRef.current && postId) {
        setScrollPosition(postId, scrollRef.current.scrollTop);
      }
    };
  }, [postId, setScrollPosition]);

  useEffect(() => {
    if (scrollRef.current && postId && !isLoading && !isSwitchingPost) {
      const savedPosition = getScrollPosition(postId);
      if (savedPosition > 0) {
        scrollRef.current.scrollTop = savedPosition;
      }
    }
  }, [postId, isLoading, isSwitchingPost, getScrollPosition]);

  const showLoader = isLoading || isSwitchingPost;

  const renderSkeletons = () => {
    return Array(7)
      .fill(0)
      .map((_, index) => <CommentCardSkeleton key={`skeleton-${index}`} />);
  };

  return (
    <div className='h-full flex flex-col bg-[#101010D9] border border-border-light overflow-hidden rounded-2xl z-[9999]'>
      <div
        ref={scrollRef}
        id='scrollableDiv'
        className='flex-1 overflow-y-auto hide-scrollbar flex flex-col'
      >
        <div ref={infoCardSentinelRef} className='p-4'>
          <PostInfoCard
            postText={text || ''}
            author={author}
            createdAt={createdAt}
            reposts={reposts}
            repostedBy={repostedBy}
          />
          <LinkShare
            url={`${process.env.NEXT_PUBLIC_APP_URL}/post/${postId}`}
          />
        </div>

        <motion.div
          className='sticky top-0 z-10 transition-all'
          animate={headerControls}
          initial={{ boxShadow: 'none', backgroundColor: 'transparent' }}
          transition={{
            duration: 0.7,
            ease: 'easeInOut',
          }}
        >
          <CommentsPanelHeader repliesCount={repliesCount} onClose={onClose} />
        </motion.div>

        <div className='flex-1'>
          {showLoader ? (
            <div className='w-full'>{renderSkeletons()}</div>
          ) : (
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
                  <CommentCard
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
                    }}
                    postAuthorId={authorId}
                    isLast={index === allComments.length - 1}
                    originalPostId={postId}
                  />
                ))
              )}
            </InfiniteScroll>
          )}
        </div>
      </div>

      <div className='mt-auto'>
        <AddComment postId={postId} authorId={authorId} />
      </div>
    </div>
  );
};

export default CommentsPanel;
