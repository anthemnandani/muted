'use client';

import CommentsPanel from '@/components/comments/CommentsPanel';
import PostMediaCarousel from '@/components/posts/PostMediaCarousel';
import usePostStore from '@/store/postStore';
import { X } from 'lucide-react';
import { useCallback, useEffect } from 'react';

const PostDetailDialog = () => {
  const {
    isOpen,
    postList,
    currentIndex,
    setCurrentIndex,
    hasMorePosts,
    loadMorePosts,
    isFetchingMore,
    setIsFetchingMore,
    closeDialog,
  } = usePostStore();

  const handleClose = useCallback(() => {
    closeDialog();
    if (window.history.length > 1) {
      window.history.back();
    }
  }, [closeDialog]);

  const handleNavigation = useCallback(
    async (direction: 'up' | 'down') => {
      let newIndex = direction === 'down' ? currentIndex + 1 : currentIndex - 1;

      if (direction === 'down' && newIndex >= postList.length) {
        if (hasMorePosts) {
          setIsFetchingMore(true);
          await loadMorePosts();
          setIsFetchingMore(false);
        } else {
          return;
        }
      }

      if (newIndex >= 0 && newIndex < postList.length) {
        setCurrentIndex(newIndex);
        const nextPost = postList[newIndex];
        window.history.replaceState(null, '', `/post/${nextPost.id}`);
      }
    },
    [
      currentIndex,
      postList,
      hasMorePosts,
      loadMorePosts,
      setCurrentIndex,
      setIsFetchingMore,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') handleNavigation('down');
      if (e.key === 'ArrowUp') handleNavigation('up');
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNavigation, isOpen]);

  const activePost = postList[currentIndex];

  if (!activePost || !isOpen) return null;

  return (
    <div className='fixed inset-0 z-[3000] flex w-full h-screen max-w-full bg-[#121212]'>
      <button
        type='button'
        className='post-detail-btn absolute top-4 left-4 z-[3001]'
        onClick={handleClose}
      >
        <X width={24} height={24} className='text-white stroke-[2.5px]' />
      </button>

      <div className='relative flex-[2] h-full flex-center overflow-hidden'>
        <PostMediaCarousel
          key={activePost.id}
          media={activePost.media}
          author={activePost.author}
          createdAt={activePost.createdAt}
          mentions={activePost.mentions}
          postId={activePost.id}
          text={activePost.text}
          pinned={activePost.pinned}
          reposts={activePost.reposts}
          hideLikes={activePost.hideLikes}
          turnOffComments={activePost.turnOffComments}
          onNavigate={handleNavigation}
          isFirstPost={currentIndex === 0}
          isLastPost={currentIndex === postList.length - 1 && !hasMorePosts}
          isFetchingMore={isFetchingMore}
          isModal
        />
      </div>

      <div className='flex-1 h-full min-w-[350px] max-w-[500px] border-l border-zinc-800 bg-[#121212]'>
        <CommentsPanel
          key={`comments-${activePost.id}`}
          postId={activePost.id}
          onClose={handleClose}
          authorId={activePost.author.id}
          isOpen={true}
          repliesCount={activePost.repliesCount}
          createdAt={activePost.createdAt}
          text={activePost.text!}
          author={activePost.author}
          reposts={activePost.reposts}
        />
      </div>
    </div>
  );
};

export default PostDetailDialog;
