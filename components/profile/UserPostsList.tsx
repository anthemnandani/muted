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
  type = 'post',
  collectionId = null,
}: UserPostsListProps) => {
  const EMPTY_STATE_CONFIG: Record<
    string,
    { title: string; description: string }
  > = {
    liked: {
      title: 'No liked posts yet',
      description: 'Posts you liked will appear here',
    },
    repost: {
      title: 'No reposted posts yet',
      description: 'Posts you reposted will appear here',
    },
    collection: {
      title: 'No posts in the collection yet',
      description: 'Add posts in the collection to see them here',
    },
    post: {
      title: 'Upload your first post',
      description: 'Upload your first post',
    },
  } as const;

  return posts.length === 0 ? (
    <EmptyState
      icon={
        <div className='size-[92px] rounded-full flex-center bg-zinc-800'>
          <Icons.emptyPost className='size-11 text-white/90' />
        </div>
      }
      title={EMPTY_STATE_CONFIG[type].title}
      description={EMPTY_STATE_CONFIG[type].description}
    />
  ) : (
    <InfiniteScroll
      dataLength={posts.length}
      next={fetchNextPage}
      hasMore={hasNextPage ?? false}
      className='w-full mt-6'
      loader={
        <div className='col-span-full flex-center py-10'>
          <Icons.loading className='size-11' />
        </div>
      }
    >
      <div className='main-grid'>
        {posts.map((post, index) => (
          <UserPostCard
            key={post.id}
            username={username}
            media={post.media}
            postId={post.id}
            pinned={post.pinned}
            type={type}
            index={index}
            collectionId={collectionId}
          />
        ))}
      </div>
    </InfiniteScroll>
  );
};

export default UserPostsList;
