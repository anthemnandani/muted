import { usePostStore } from '@/store/postStore';
import useVideoPlayer from '@/store/videoPlayer';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export const usePostNavigation = (id: string, username: string) => {
  const { navigationPosts, currentPostIndex, setPostById, setPostsByUser } =
    usePostStore();
  const { setCurrentlyPlaying } = useVideoPlayer();
  const router = useRouter();

  useEffect(() => {
    Promise.all([setPostById(id, username), setPostsByUser(username)]);
  }, [id, username, setPostById, setPostsByUser]);

  const navigateToPost = (direction: 'up' | 'down') => {
    if (!navigationPosts?.length) return;

    const targetIndex =
      direction === 'up' ? currentPostIndex - 1 : currentPostIndex + 1;

    if (targetIndex >= 0 && targetIndex < navigationPosts.length) {
      const targetPost = navigationPosts[targetIndex];
      setCurrentlyPlaying(null);
      router.replace(`/@${username}/post/${targetPost.id}`);
    }
  };

  return {
    navigateToPost,
    isFirstPost: currentPostIndex === 0,
    isLastPost: currentPostIndex === navigationPosts?.length - 1,
  };
};
