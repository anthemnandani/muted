'use client';
import { ParentPostProps } from '@/lib/types';
import React, { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import ThreadCard from '../cards/ThreadCard';
import { Icons } from '../icons';

interface ThreadsListProps {
  posts?: ParentPostProps[];
  fetchNextPage: any;
  hasNextPage?: boolean;
}

const ThreadsList: React.FC<ThreadsListProps> = ({
  posts,
  fetchNextPage,
  hasNextPage,
}) => {
  const [uniquePosts, setUniquePosts] = useState<ParentPostProps[]>([]);

  useEffect(() => {
    if (posts) {
      const seenPosts = new Set();
      const newUniquePosts = posts.filter((post) => {
        const key = post.repostedBy
          ? `repost-${post.repostedBy.id}-${post.id}`
          : `post-${post.id}`;
        if (seenPosts.has(key)) {
          return false;
        }
        seenPosts.add(key);
        return true;
      });
      setUniquePosts(newUniquePosts);
    }
  }, [posts]);

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
        <ThreadCard
          key={
            post.repostedBy
              ? `repost-${post.repostedBy.id}-${post.id}`
              : `post-${post.id}`
          }
          {...post}
          isLastThread={index === uniquePosts.length - 1}
        />
      ))}
    </InfiniteScroll>
  );
};

export default ThreadsList;
