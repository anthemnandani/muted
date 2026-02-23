'use client';

import usePostStore from '@/store/postStore';
import { useCallback, useEffect } from 'react';
import PostDetailsLayout from '../shared/PostDetailsLayout';

const MultiPostDialog = ({ query }: { query?: string }) => {
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
        window.history.replaceState(
          null,
          '',
          `/post/${nextPost.id}${query ? `?q=${encodeURIComponent(query)}` : ''}`,
        );
      }
    },
    [
      currentIndex,
      postList,
      hasMorePosts,
      loadMorePosts,
      setCurrentIndex,
      setIsFetchingMore,
    ],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'ArrowDown') handleNavigation('down');
      if (e.key === 'ArrowUp') handleNavigation('up');
      if (e.key === 'Escape') handleClose();
    };

    const handlePopState = () => {
      if (isOpen) {
        closeDialog();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [handleNavigation, isOpen, closeDialog]);

  const activePost = postList[currentIndex];

  if (!activePost || !isOpen) return null;

  return (
    <div className='fixed inset-0 z-[999] flex w-full h-screen max-w-full bg-[#121212]'>
      <PostDetailsLayout
        post={activePost}
        onClose={handleClose}
        onNavigate={handleNavigation}
        isFirstPost={currentIndex === 0}
        isLastPost={currentIndex === postList.length - 1 && !hasMorePosts}
        isFetchingMore={isFetchingMore}
        isModal
      />
    </div>
  );
};

export default MultiPostDialog;
