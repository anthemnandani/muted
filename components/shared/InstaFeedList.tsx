'use client';

import type { PostsListProps } from '@/lib/types';
import { Fragment, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import InstaFeedCard from '../cards/InstaFeedCard';
import { Icons } from '../icons';
import InstaCardSkeleton from '../skeletons/InstaCardSkeleton';

const InstaFeedList: React.FC<PostsListProps> = ({
  isLoading,
  posts,
  fetchNextPage,
  hasNextPage,
  emptyStateMessage,
}) => {
  const uniquePosts = useMemo(() => {
    if (!posts) return [];
    const seen = new Set<string>();
    return posts.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }, [posts]);

  return (
    <Fragment>
      {!isLoading && uniquePosts.length === 0 && (
        <div className='flex-center w-full h-screen'>
          <p className='text-gray-3'>{emptyStateMessage || 'No posts found'}</p>
        </div>
      )}
      {isLoading ? (
        <div>
          {[...Array(4)].map((_, i) => (
            <InstaCardSkeleton key={i} />
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
          {uniquePosts.map((post) => (
            <InstaFeedCard key={`home-${post.id}`} {...post} />
          ))}
        </InfiniteScroll>
      )}
    </Fragment>
  );
};

export default InstaFeedList;
