'use client';

import { PostsListProps } from '@/lib/types';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import PostCard from '../cards/PostCard';
import { Icons } from '../icons';
import PostCardSkeleton from '../skeletons/PostCardSkeleton';

const PostsList: React.FC<PostsListProps> = ({
  isLoading,
  posts,
  fetchNextPage,
  hasNextPage,
  showMuted,
  emptyStateMessage,
}) => {
  const uniquePosts = React.useMemo(() => {
    if (!posts) return [];
    const seenPosts = new Set();
    return posts.filter((post) => {
      const key = post.repostedBy
        ? `repost-${post.repostedBy.id}-${post.id}`
        : `post-${post.id}`;
      if (seenPosts.has(key)) return false;
      seenPosts.add(key);
      return true;
    });
  }, [posts]);

  return (
    <React.Fragment>
      {!isLoading && uniquePosts.length === 0 && (
        <div className='flex-center w-full h-screen'>
          <p className='text-gray-3'>{emptyStateMessage || 'No posts found'}</p>
        </div>
      )}
      {isLoading ? (
        <div>
          {[...Array(10)].map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={uniquePosts.length}
          next={fetchNextPage}
          hasMore={hasNextPage ?? false}
          className='h-screen'
          scrollableTarget='main-scroll-container'
          loader={
            <div className='h-[80px] w-full flex-center mb-[10vh] sm:mb-0'>
              <Icons.loading className='size-11' />
            </div>
          }
        >
          {uniquePosts.map((post, index) => (
            <div
              key={
                post.repostedBy
                  ? `repost-${post.repostedBy.id}-${post.id}`
                  : `post-${post.id}`
              }
            >
              <PostCard
                {...post}
                showMuted={showMuted}
                index={index}
                totalPosts={uniquePosts.length}
              />
            </div>
          ))}
          {/* <PostNavigator /> */}
        </InfiniteScroll>
      )}
    </React.Fragment>
  );
};

export default PostsList;
