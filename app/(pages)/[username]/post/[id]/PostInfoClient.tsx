'use client';

import PostCard from '@/components/cards/PostCard';
import { Icons } from '@/components/icons';
import PostCardSkeleton from '@/components/skeletons/PostCardSkeleton';
import { usePostNavigation } from '@/hooks/usePostNavigation';
import { cn } from '@/lib/utils';
import { usePostStore } from '@/store/postStore';
import React from 'react';

const PostInfoClient = ({ id, username }: { id: string; username: string }) => {
  const { isLoadingPost, isLoadingUserPosts, postById } = usePostStore();

  const isLoading = isLoadingPost || isLoadingUserPosts;

  const { navigateToPost, isFirstPost, isLastPost } = usePostNavigation(
    id,
    username,
    isLoading
  );

  return (
    <React.Fragment key={id}>
      {isLoadingPost || !postById ? (
        <PostCardSkeleton />
      ) : (
        <React.Fragment>
          {postById && <PostCard {...postById} />}
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
      )}
    </React.Fragment>
  );
};

export default PostInfoClient;
