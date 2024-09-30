'use client';
import { ParentPostProps } from '@/lib/types';
import React from 'react';
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
  return (
    <InfiniteScroll
      dataLength={posts?.length ?? 0}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      loader={
        <div className='h-[80px] w-full flex-center mb-[10vh] sm:mb-0'>
          <Icons.loading className='size-11' />
        </div>
      }
    >
      {posts?.map((post, index) => {
        return (
          <ThreadCard
            key={
              post.repostedBy
                ? `repost-${post.repostedBy.id}-${post.id}`
                : `post-${post.id}`
            }
            {...post}
            isLastThread={index == posts.length - 1}
          />
        );
      })}
    </InfiniteScroll>
  );
};

export default ThreadsList;
