import type { UserPostsListProps } from '@/lib/types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Icons } from '../icons';
import UserPostCard from './UserPostCard';

const UserPostsList = ({
  posts,
  fetchNextPage,
  hasNextPage,
}: UserPostsListProps) => {
  return (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      className='
      w-full grid gap-y-6 gap-x-4
      grid-cols-[repeat(auto-fit,minmax(200px,1fr))]
      xl:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]
      2xl:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] mt-6'
      loader={
        <div className='col-span-full flex-center'>
          <Icons.loading className='size-11' />
        </div>
      }
    >
      {posts.map((post) => (
        <UserPostCard key={post.id} media={post.media} postId={post.id} />
      ))}
    </InfiniteScroll>
  );
};

export default UserPostsList;
