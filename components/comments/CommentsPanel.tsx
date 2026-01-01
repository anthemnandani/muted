'use client';

import useGetComments from '@/hooks/useGetComments';
import { useRepost } from '@/hooks/useRepost';
import { CommentsPanelProps } from '@/lib/types';
import useAddCommentStore from '@/store/addComment';
import useCommentPanelStore from '@/store/commentPanel';
import useSortByComments from '@/store/sortByComments';
import { motion, useAnimation } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useInView } from 'react-intersection-observer';
import { toast } from 'sonner';
import BookmarkButton from '../buttons/BookmarkButton';
import LikeButton from '../buttons/LikeButton';
import CommentCard from '../cards/CommentCard';
import PostInfoCard from '../cards/PostInfoCard';
import { Icons } from '../icons';
import CommentCardSkeleton from '../skeletons/CommentCardSkeleton';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import AddComment from './AddComment';
import CommentsPanelHeader from './CommentsPanelHeader';
import LinkShare from './LinkShare';

const CommentsPanel: React.FC<CommentsPanelProps> = ({
  postId,
  onClose,
  authorId,
  isOpen,
  repliesCount,
  text,
  createdAt,
  author,
  repostedBy,
  likesCount,
  likes,
  bookmarksCount,
  bookmarks,
  hideLikes,
  reposts,
  repostsCount: initialRepostsCount,
  isModal = false,
}) => {
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
    if (scrollRef.current && postId && !isLoading) {
      const savedPosition = getScrollPosition(postId);
      if (savedPosition > 0) {
        scrollRef.current.scrollTop = savedPosition;
      }
    }
  }, [postId, isLoading, getScrollPosition]);

  const renderSkeletons = () => {
    return Array(7)
      .fill(0)
      .map((_, index) => <CommentCardSkeleton key={`skeleton-${index}`} />);
  };

  const url = `${process.env.NEXT_PUBLIC_APP_URL}/post/${postId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard');
  };

  const {
    isRepostedByMe,
    isLoading: isRepostLoading,
    handleToggleRepost,
  } = useRepost({
    reposts,
    initialRepostsCount,
    postId,
  });

  return (
    <div className='h-full flex flex-col bg-[#101010D9] border border-border-light'>
      <div
        ref={scrollRef}
        id='scrollableDiv'
        className='flex-1 overflow-y-auto scrollbar-hide flex flex-col'
      >
        <div ref={infoCardSentinelRef} className='p-4'>
          <PostInfoCard
            postText={text || ''}
            author={author}
            createdAt={createdAt}
            reposts={reposts}
            repostedBy={repostedBy}
          />
          {isModal && (
            <div className='mb-4 px-4'>
              <div className='flex-between'>
                <div className='flex items-center gap-5'>
                  <LikeButton
                    likeInfo={{
                      id: postId,
                      likesCount: likesCount!,
                      likes: likes!,
                    }}
                    hideLikes={hideLikes}
                    authorId={author?.id}
                    isPanel
                  />
                  <div className='flex items-center'>
                    <button
                      type='button'
                      aria-label={`${repliesCount} comments`}
                      className='btn-action mt-0 mb-0 size-9 mr-1.5 cursor-default'
                    >
                      <Icons.message className='size-5' fill='#fff' />
                    </button>
                    <strong className='text-[13px] leading-4 text-white/75 text-center'>
                      {repliesCount}
                    </strong>
                  </div>
                  <BookmarkButton
                    bookmarkInfo={{
                      id: postId,
                      bookmarksCount,
                      bookmarks,
                    }}
                    isPanel
                  />
                </div>
                <div className='flex items-center'>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        aria-label='Repost'
                        className='mr-2 disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={isRepostLoading}
                        onClick={handleToggleRepost}
                      >
                        {isRepostedByMe ? (
                          <Icons.reposted width={24} height={24} />
                        ) : (
                          <Icons.repost width={24} height={24} />
                        )}
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className='z-[3001]'>
                      <p>{isRepostedByMe ? 'Remove repost' : 'Repost'}</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type='button'
                        aria-label='Copy'
                        className='mr-2'
                        onClick={handleCopy}
                      >
                        <Icons.copy width={24} height={24} />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent className='z-[3001]'>
                      <p>Copy</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`https://wa.me/?text=${url}`}
                        aria-label='Share on WhatsApp'
                        className='mr-2'
                        target='_blank'
                      >
                        <Icons.whatsapp width={24} height={24} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className='z-[3001]'>
                      <p>Share on WhatsApp</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`https://www.facebook.com/sharer/sharer.php?u=${url}`}
                        aria-label='Share on Facebook'
                        className='mr-2'
                        target='_blank'
                      >
                        <Icons.facebook width={24} height={24} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className='z-[3001]'>
                      <p>Share on Facebook</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          )}
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
          {isLoading ? (
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
