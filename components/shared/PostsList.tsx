'use client';

import { PostsListProps } from '@/lib/types';
import { Fragment, useEffect, useMemo, useRef } from 'react';
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
  resetToFirst = false,
  onResetComplete,
  containerRef,
}) => {
  const firstPostRef = useRef<HTMLDivElement>(null);

  const uniquePosts = useMemo(() => {
    if (!posts) return [];
    const seenPosts = new Set();
    return posts.filter((post) => {
      const key = `post-${post.id}`;
      if (seenPosts.has(key)) return false;
      seenPosts.add(key);
      return true;
    });
  }, [posts]);

  useEffect(() => {
    if (resetToFirst && !isLoading && uniquePosts.length > 0) {
      containerRef?.current?.scrollTo({ top: 0, behavior: 'instant' });

      if (firstPostRef.current) {
        firstPostRef.current.scrollIntoView({
          block: 'start',
          behavior: 'instant',
        });
      }

      if (onResetComplete) {
        onResetComplete();
      }
    }
  }, [resetToFirst, isLoading, uniquePosts, onResetComplete, containerRef]);

  return (
    <Fragment>
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
              key={`post-${post.id}`}
              ref={index === 0 ? firstPostRef : null}
            >
              <PostCard
                {...post}
                showMuted={showMuted}
                index={index}
                totalPosts={uniquePosts.length}
              />
            </div>
          ))}
        </InfiniteScroll>
      )}
    </Fragment>
  );
};

export default PostsList;
