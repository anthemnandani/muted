'use client';

import Loading from '@/app/(pages)/loading';
import { ThreadsListProps } from '@/lib/types';
import React, { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ThreadCard from '../cards/ThreadCard';
import { Icons } from '../icons';

const ThreadsList: React.FC<ThreadsListProps> = ({
  isLoading,
  posts,
  fetchNextPage,
  hasNextPage,
  showMuted,
}) => {
  const uniquePosts = useMemo(() => {
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
    <>
      {!isLoading && uniquePosts?.length === 0 && (
        <div className='h-[50vh] w-full flex-center text-gray-3'>
          <p>No posts found.</p>
        </div>
      )}
      {isLoading ? (
        <Loading className='md:!h-[80vh]' />
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
              <ThreadCard
                {...post}
                showMuted={showMuted}
                isLastThread={index === uniquePosts.length - 1}
              />
            </div>
          ))}
        </InfiniteScroll>
      )}
    </>
  );
};

export default ThreadsList;
