'use client';
import React from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Icons } from '../icons';
import ThreadCard from '../cards/ThreadCard';
import { PostProps } from '@/lib/types';

interface ThreadsListProps {
  posts?: PostProps[];
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
            key={post.id}
            {...post}
            isLastThread={index == posts.length - 1}
          />
        );
      })}
    </InfiniteScroll>
  );
};

export default ThreadsList;
