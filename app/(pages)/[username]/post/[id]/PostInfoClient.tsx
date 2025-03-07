'use client';

import PostCard from '@/components/cards/PostCard';
import { Icons } from '@/components/icons';
import PostCardSkeleton from '@/components/skeletons/PostCardSkeleton';
import { cn } from '@/lib/utils';
import { usePostStore } from '@/store/postStore';
import useVideoPlayer from '@/store/videoPlayer';
import { useRouter } from 'next/navigation';
import React from 'react';

const PostInfoClient = ({ id, username }: { id: string; username: string }) => {
  const {
    postById,
    navigationPosts,
    currentPostIndex,
    setPostById,
    setPostsByUser,
    isLoadingPost,
    isLoadingUserPosts,
  } = usePostStore();
  const { setCurrentlyPlaying } = useVideoPlayer();

  React.useEffect(() => {
    Promise.all([setPostById(id, username), setPostsByUser(username)]);
  }, [id, username, setPostById, setPostsByUser]);

  const router = useRouter();
  const isFirstPost = currentPostIndex === 0;
  const isLastPost = currentPostIndex === navigationPosts?.length - 1;

  const isLoading = isLoadingPost || isLoadingUserPosts;

  const navigateToPost = (direction: 'up' | 'down') => {
    if (!navigationPosts?.length) return;

    const targetIndex =
      direction === 'up' ? currentPostIndex - 1 : currentPostIndex + 1;

    if (targetIndex >= 0 && targetIndex < navigationPosts.length) {
      const targetPost = navigationPosts[targetIndex];
      setCurrentlyPlaying(null);
      router.push(`/@${username}/post/${targetPost.id}`);
    }
  };

  return (
    <React.Fragment key={id}>
      {isLoadingPost && !postById ? (
        <PostCardSkeleton />
      ) : (
        postById && <PostCard {...postById} />
      )}
      <div className='fixed right-4 top-1/2 -translate-y-1/2 flex flex-col justify-center gap-4 w-fit'>
        <button
          className={cn(
            'navigator-btn',
            (isFirstPost || isLoading) && 'cursor-not-allowed opacity-40'
          )}
          onClick={() => navigateToPost('up')}
          disabled={isFirstPost || isLoading}
        >
          <Icons.chevronUp className='size-6 text-white/90 font-medium' />
        </button>
        <button
          className={cn(
            'navigator-btn',
            (isLastPost || isLoading) && 'cursor-not-allowed opacity-40'
          )}
          disabled={isLastPost || isLoading}
          onClick={() => navigateToPost('down')}
        >
          <Icons.chevronDown className='size-6 text-white/90 font-medium' />
        </button>
      </div>
    </React.Fragment>
  );
};

export default PostInfoClient;
