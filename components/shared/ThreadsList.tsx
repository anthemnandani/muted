'use client';
import {
  ParentPostProps,
  ThreadDisplayProps,
  ThreadsListProps,
} from '@/lib/types';
import React, { useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ThreadCard from '../cards/ThreadCard';
import { Icons } from '../icons';

const ThreadsList: React.FC<ThreadsListProps> = ({
  posts,
  fetchNextPage,
  hasNextPage,
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

  const renderThreadCard = (
    post: ParentPostProps,
    displayProps: ThreadDisplayProps
  ) => <ThreadCard {...post} {...displayProps} />;

  return (
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
          {post.parentPost &&
            renderThreadCard(post.parentPost, {
              showLine: true,
              showUsername: true,
            })}
          {renderThreadCard(post, {
            isLastThread: index === uniquePosts.length - 1,
            isNested: !!post.parentPost,
          })}
        </div>
      ))}
    </InfiniteScroll>
  );
};

export default ThreadsList;
