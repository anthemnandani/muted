'use client';

import useGetComments from '@/hooks/useGetComments';
import { CommentsProps } from '@/lib/types';
import useAddCommentStore from '@/store/addComment';
import useCommentPanelStore from '@/store/commentPanel';
import { SlidersHorizontal, X } from 'lucide-react';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Icons } from '../icons';
import Loader from '../shared/Loader';
import { ScrollArea } from '../ui/scroll-area';
import AddComment from './AddComment';
import CommentCard from './CommentCard';

const CommentsPanel: React.FC<CommentsProps> = ({
  postId,
  onClose,
  authorId,
  isOpen,
}) => {
  const [isSwitchingPost, setIsSwitchingPost] = useState(false);
  const prevPostIdRef = useRef(postId);

  useEffect(() => {
    if (prevPostIdRef.current !== postId) {
      setIsSwitchingPost(true);
      prevPostIdRef.current = postId;
    }
  }, [postId]);

  const { allReplies, isLoading, hasNextPage, fetchNextPage } = useGetComments({
    postId,
  });

  useEffect(() => {
    if (!isLoading && isSwitchingPost) {
      setIsSwitchingPost(false);
    }
  }, [isLoading, isSwitchingPost]);

  const { reset } = useAddCommentStore();
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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollContainer = e.currentTarget;
    const scrollPosition = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight;
    const clientHeight = scrollContainer.clientHeight;

    if (postId) {
      setScrollPosition(postId, scrollPosition);
    }

    if (
      scrollHeight - scrollPosition - clientHeight < 200 &&
      hasNextPage &&
      !isLoading
    ) {
      fetchNextPage();
    }
  };

  const showLoader = isLoading || isSwitchingPost;

  return (
    <div className='flex flex-col h-full bg-[#101010D9] border border-border-light rounded-2xl'>
      <div className='flex justify-between items-center px-4 py-3 border-b border-border-light'>
        <div className='flex items-center gap-2'>
          <h2 className='text-lg font-semibold text-white'>Comments</h2>
          {!showLoader && (
            <span className='text-gray-400 text-sm'>{allReplies.length}</span>
          )}
        </div>
        <div className='flex items-center gap-3'>
          <button className='text-gray-400'>
            <SlidersHorizontal className='size-5' />
          </button>
          <button className='text-gray-400' onClick={onClose}>
            <X className='size-5' />
          </button>
        </div>
      </div>

      {showLoader ? (
        <div className='flex-center h-full'>
          <Loader />
        </div>
      ) : (
        <ScrollArea
          className='flex-1 max-h-[calc(90vh-80px)]'
          onScroll={handleScroll}
          ref={scrollRef}
        >
          {allReplies.length === 0 ? (
            <p className='text-center text-gray-400 py-8'>No comments yet</p>
          ) : (
            <Fragment>
              {allReplies.map((comment) => (
                <CommentCard
                  key={comment.id}
                  comment={{
                    id: comment.id,
                    text: comment.text,
                    author: comment.author,
                    createdAt: comment.createdAt,
                    likesCount: comment.likesCount,
                  }}
                />
              ))}
              {hasNextPage && (
                <div className='py-4 flex justify-center'>
                  <Icons.loading className='size-8' />
                </div>
              )}
            </Fragment>
          )}
        </ScrollArea>
      )}

      <AddComment postId={postId} authorId={authorId} />
    </div>
  );
};

export default CommentsPanel;
