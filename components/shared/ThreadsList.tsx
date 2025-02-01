'use client';

import { ThreadsListProps } from '@/lib/types';
import Link from 'next/link';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ThreadCard from '../cards/ThreadCard';
import { Icons } from '../icons';
import ThreadCardSkeleton from '../skeletons/ThreadCardSkeleton';

const ThreadsList: React.FC<ThreadsListProps> = ({
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
            <ThreadCardSkeleton key={index} />
          ))}
        </div>
      ) : (
        <InfiniteScroll
          dataLength={uniquePosts.length}
          next={fetchNextPage}
          hasMore={hasNextPage ?? false}
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
              {post.parentPostId && (
                <>
                  {post.parentPost && (
                    <ThreadCard
                      {...post.parentPost}
                      showMuted={showMuted}
                      variant='reply'
                      showUsername
                    />
                  )}
                  <div className='mt-4 px-2 md:px-4'>
                    <Link
                      href={`/@${post.parentPost?.author.username}/post/${post.parentPost?.id}`}
                      className='text-gray-3 text-[15px] leading-5'
                    >
                      Replying to @{post.parentPost?.author.username}
                    </Link>
                  </div>
                </>
              )}
              <ThreadCard
                {...post}
                showMuted={showMuted}
                variant={post.parentPostId ? 'reply' : 'default'}
                isLastThread={index === uniquePosts.length - 1}
              />
            </div>
          ))}
        </InfiniteScroll>
      )}
    </React.Fragment>
  );
};

export default ThreadsList;
