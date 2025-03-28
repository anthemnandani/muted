'use client';

import useGetComments from '@/hooks/useGetComments';
import { CommentsProps } from '@/lib/types';
import useAddCommentStore from '@/store/addComment';
import useCommentPanelStore from '@/store/commentPanel';
import { X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Icons } from '../icons';
import CommentCardSkeleton from '../skeletons/CommentCardSkeleton';
import AddComment from './AddComment';
import CommentCard from './CommentCard';

const CommentsPanel: React.FC<CommentsProps> = ({
  postId,
  onClose,
  authorId,
  isOpen,
  repliesCount,
}) => {
  const [isSwitchingPost, setIsSwitchingPost] = useState(false);
  const prevPostIdRef = useRef(postId);
  const { reset, setCurrentPostId } = useAddCommentStore();

  useEffect(() => {
    setCurrentPostId(postId);

    if (prevPostIdRef.current !== postId) {
      setIsSwitchingPost(true);
      prevPostIdRef.current = postId;
    }
  }, [postId, setCurrentPostId, reset]);

  const { allComments, isLoading, hasNextPage, fetchNextPage } = useGetComments(
    {
      postId,
    }
  );

  useEffect(() => {
    if (!isLoading && isSwitchingPost) {
      setIsSwitchingPost(false);
    }
  }, [isLoading, isSwitchingPost]);

  const { setScrollPosition, getScrollPosition } = useCommentPanelStore();

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
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
      } else {
        scrollRef.current.scrollTop = 0;
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
    <div className='h-full bg-[#101010D9] border border-border-light rounded-2xl'>
      <div className='flex-between px-4 py-3 border-b border-border-light'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-semibold text-white'>
            Comment{repliesCount === 1 ? '' : 's'}
          </h2>
          <span className='text-gray-400 text-sm'>{repliesCount}</span>
        </div>
        <div className='flex items-center gap-3'>
          <button className='text-gray-400'>
            <Icons.filter />
          </button>
          <button className='text-gray-400' onClick={onClose}>
            <X className='size-5' />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        id='scrollableDiv'
        className='h-full overflow-y-auto max-h-[calc(90vh-8rem)] flex flex-col hide-scrollbar'
      >
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
              <p className='text-center text-gray-400 py-8'>No comments yet</p>
            ) : (
              allComments.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={{
                    id: comment.id,
                    text: comment.text,
                    author: comment.author,
                    createdAt: comment.createdAt,
                    likesCount: comment.likesCount,
                    likes: comment.likes,
                  }}
                />
              ))
            )}
          </InfiniteScroll>
        )}
      </div>

      <AddComment postId={postId} authorId={authorId} />
    </div>
  );
};

export default CommentsPanel;
