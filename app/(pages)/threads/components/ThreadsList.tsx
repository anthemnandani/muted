'use client';
import ThreadCard from '@/components/cards/ThreadCard';
import { Icons } from '@/components/icons';
import { ThreadsListProps } from '@/lib/types';
import InfiniteScroll from 'react-infinite-scroll-component';

const ThreadsList: React.FC<ThreadsListProps> = ({
  threads,
  fetchNextPage,
  hasNextPage,
}) => {
  //   const uniquePosts = useMemo(() => {
  //     if (!posts) return [];
  //     const seenPosts = new Set();
  //     return posts.filter((post) => {
  //       const key = post.repostedBy
  //         ? `repost-${post.repostedBy.id}-${post.id}`
  //         : `post-${post.id}`;
  //       if (seenPosts.has(key)) return false;
  //       seenPosts.add(key);
  //       return true;
  //     });
  //   }, [posts]);

  return (
    <InfiniteScroll
      dataLength={threads.length}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      loader={
        <div className='h-[80px] w-full flex-center mb-[10vh] sm:mb-0'>
          <Icons.loading className='size-11' />
        </div>
      }
    >
      {threads.map((thread, index) => (
        <div key={thread.id}>
          <ThreadCard {...thread} isLastThread={index === threads.length - 1} />
        </div>
      ))}
    </InfiniteScroll>
  );
};

export default ThreadsList;
