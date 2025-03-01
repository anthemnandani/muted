import type { UserPostsListProps } from '@/lib/types';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Icons } from '../icons';
import EmptyState from '../shared/EmptyState';
import UserPostCard from './UserPostCard';

const UserPostsList = ({
  posts,
  username,
  fetchNextPage,
  hasNextPage,
  likedPosts = false,
}: UserPostsListProps) => {
  return posts.length === 0 ? (
    <EmptyState
      icon={
        <div className='size-[92px] rounded-full flex-center bg-zinc-800'>
          <Icons.emptyPost className='size-11 text-white/90' />
        </div>
      }
      title={likedPosts ? 'No liked posts yet' : 'Upload your first video'}
      description={
        likedPosts
          ? 'Videos you liked will appear here'
          : 'Your videos will appear here'
      }
    />
  ) : (
    // <InfiniteScroll
    //   dataLength={posts.length}
    //   next={fetchNextPage}
    //   hasMore={hasNextPage ?? false}
    //   className='
    //   w-full grid gap-y-6 gap-x-4
    //   grid-cols-[repeat(auto-fit,minmax(200px,1fr))]
    //   xl:grid-cols-[repeat(auto-fit,minmax(220px,1fr))]
    //   2xl:grid-cols-[repeat(auto-fit,minmax(240px,1fr))] mt-6'
    //   loader={
    //     <div className='col-span-full flex-center'>
    //       <Icons.loading className='size-11' />
    //     </div>
    //   }
    // >
    //   {posts.map((post) => (
    //     <UserPostCard key={post.id} media={post.media} postId={post.id} />
    //   ))}
    // </InfiniteScroll>
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      className='w-full mt-6'
      loader={
        <div className='col-span-full flex-center'>
          <Icons.loading className='size-11' />
        </div>
      }
    >
      <div className='main-grid'>
        {posts.map((post) => (
          <UserPostCard
            key={post.id}
            username={username}
            media={post.media}
            postId={post.id}
            pinned={post.pinned}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default UserPostsList;
