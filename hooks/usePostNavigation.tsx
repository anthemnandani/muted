import { NavigationType } from '@/lib/types';
import { usePostStore } from '@/store/postStore';
import useVideoPlayer from '@/store/videoPlayer';
import { useRouter } from 'next/navigation';
import React from 'react';

interface UsePostNavigationProps {
  id: string;
  username: string;
  isLoading: boolean;
  type: NavigationType;
}

export const usePostNavigation = ({
  id,
  username,
  isLoading,
  type = 'post',
}: UsePostNavigationProps) => {
  const { navigationPosts, currentPostIndex, setPostById, setPostsByUser } =
    usePostStore();
  const { setCurrentlyPlaying } = useVideoPlayer();
  const isFirstPost = currentPostIndex === 0;
  const isLastPost = currentPostIndex === navigationPosts?.length - 1;
  const router = useRouter();

  React.useEffect(() => {
    Promise.all([
      setPostById(id, username, type),
      setPostsByUser(username, type),
    ]);
  }, [id, username, setPostById, setPostsByUser]);

  const navigateToPost = (direction: 'up' | 'down') => {
    if (!navigationPosts?.length) return;

    const targetIndex =
      direction === 'up' ? currentPostIndex - 1 : currentPostIndex + 1;

    if (targetIndex >= 0 && targetIndex < navigationPosts.length) {
      const targetPost = navigationPosts[targetIndex];
      setCurrentlyPlaying(null);
      router.replace(`/@${username}/${type}/${targetPost.id}`);
    }
  };

  const debounceTimeout = React.useRef<NodeJS.Timeout | null>(null);
  const touchDebounceTimeout = React.useRef<NodeJS.Timeout | null>(null);

  const handleScroll = (e: WheelEvent) => {
    if (isLoading) return;

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      if (e.deltaY > 0 && !isLastPost) {
        navigateToPost('down');
      } else if (e.deltaY < 0 && !isFirstPost) {
        navigateToPost('up');
      }
    }, 500);
  };

  const touchStartRef = React.useRef<number | null>(null);
  const handleTouchStart = (e: TouchEvent) => {
    touchStartRef.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e: TouchEvent) => {
    if (isLoading || touchStartRef.current === null) return;

    const touchEnd = e.changedTouches[0].clientY;
    const delta = touchStartRef.current - touchEnd;

    if (touchDebounceTimeout.current) {
      clearTimeout(touchDebounceTimeout.current);
    }

    touchDebounceTimeout.current = setTimeout(() => {
      if (delta > 30 && !isLastPost) {
        navigateToPost('down');
      } else if (delta < -30 && !isFirstPost) {
        navigateToPost('up');
      }
    }, 500);
    touchStartRef.current = null;
  };

  React.useEffect(() => {
    window.addEventListener('wheel', handleScroll);

    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);

    return () => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      if (touchDebounceTimeout.current) {
        clearTimeout(touchDebounceTimeout.current);
      }
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [currentPostIndex, navigationPosts, isLoading]);

  return {
    navigateToPost,
    isFirstPost: currentPostIndex === 0,
    isLastPost: currentPostIndex === navigationPosts?.length - 1,
  };
};
