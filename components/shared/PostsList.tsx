'use client';

import { PostsListProps } from '@/lib/types';
import { Fragment, useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (resetToFirst && !isLoading && posts && posts.length > 0) {
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
  }, [resetToFirst, isLoading, posts, onResetComplete, containerRef]);

  return (
    <Fragment>
      {!isLoading && posts?.length === 0 && (
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
          dataLength={posts?.length ?? 0}
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
          {posts?.map((post, index) => (
            <div
              key={`post-${post.id}`}
              ref={index === 0 ? firstPostRef : null}
            >
              <PostCard
                {...post}
                showMuted={showMuted}
                index={index}
                totalPosts={posts.length}
              />
            </div>
          ))}
        </InfiniteScroll>
      )}
    </Fragment>
  );
};

export default PostsList;
