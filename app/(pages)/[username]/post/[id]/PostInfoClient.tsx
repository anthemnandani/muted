'use client';

import NavigationButtons from '@/components/buttons/NavigationButtons';
import PostCard from '@/components/cards/PostCard';
import PostCardSkeleton from '@/components/skeletons/PostCardSkeleton';
import { usePostNavigation } from '@/hooks/usePostNavigation';
import { PostInfoClientProps } from '@/lib/types';
import { usePostStore } from '@/store/postStore';
import React from 'react';

const PostInfoClient = ({
  id,
  username,
  type = 'post',
}: PostInfoClientProps) => {
  const { isLoadingPost, isLoadingUserPosts, postById } = usePostStore();

  const isLoading = isLoadingPost || isLoadingUserPosts;

  const { navigateToPost, isFirstPost, isLastPost } = usePostNavigation({
    id,
    username,
    isLoading,
    type,
  });

  return (
    <React.Fragment key={id}>
      {isLoadingPost || !postById ? (
        <PostCardSkeleton />
      ) : (
        <React.Fragment>
          {postById && <PostCard {...postById} />}
          <NavigationButtons
            isFirstPost={isFirstPost}
            isLastPost={isLastPost}
            handleNavigation={navigateToPost}
            isLoading={isLoading}
          />
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default PostInfoClient;
